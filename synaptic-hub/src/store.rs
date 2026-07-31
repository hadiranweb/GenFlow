//! Event Store — Persistent storage and replay engine for Synaptic Hub events
//!
//! Provides outbox/inbox durability and idempotent processing capabilities.

use genflow_receptors::events::{EventEnvelope, EventSource};
use genflow_shared_infra::error::AppError;
use sqlx::{PgPool, Row};
use uuid::Uuid;

/// Event Store — persists events for logging, replay, and correlation tracking
pub struct EventStore {
    pool: PgPool,
}

impl EventStore {
    /// Create a new EventStore
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Append a new event to the durable event log
    pub async fn append(&self, envelope: &EventEnvelope) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO event_log (
                event_id, event_type, source, timestamp, payload,
                correlation_id, causation_id, schema_version,
                aggregate_type, aggregate_id, organization_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (event_id) DO NOTHING
            "#
        )
        .bind(envelope.event_id)
        .bind(&envelope.event_type)
        .bind(envelope.source.as_str())
        .bind(envelope.timestamp)
        .bind(&envelope.payload)
        .bind(envelope.correlation_id)
        .bind(envelope.causation_id)
        .bind(&envelope.schema_version)
        .bind(&envelope.aggregate_type)
        .bind(envelope.aggregate_id)
        .bind(envelope.organization_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("EventStore append failed: {}", e)))?;

        Ok(())
    }

    /// Check if an event has already been processed by a specific consumer (idempotency)
    pub async fn is_processed(&self, event_id: Uuid, consumer_name: &str) -> Result<bool, AppError> {
        let row = sqlx::query(
            "SELECT EXISTS(SELECT 1 FROM processed_events WHERE event_id = $1 AND consumer_name = $2)"
        )
        .bind(event_id)
        .bind(consumer_name)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("EventStore checking processed state failed: {}", e)))?;

        Ok(row.get(0))
    }

    /// Mark an event as processed by a consumer
    pub async fn mark_processed(&self, event_id: Uuid, consumer_name: &str) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO processed_events (event_id, consumer_name) VALUES ($1, $2) ON CONFLICT DO NOTHING"
        )
        .bind(event_id)
        .bind(consumer_name)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("EventStore mark_processed failed: {}", e)))?;

        Ok(())
    }

    /// Fetch all events for a given correlation ID (replays entire business journey)
    pub async fn get_by_correlation_id(&self, correlation_id: Uuid) -> Result<Vec<EventEnvelope>, AppError> {
        let rows = sqlx::query(
            r#"
            SELECT event_id, event_type, source, timestamp, payload, correlation_id,
                   causation_id, schema_version, aggregate_type, aggregate_id, organization_id
            FROM event_log
            WHERE correlation_id = $1
            ORDER BY timestamp ASC
            "#
        )
        .bind(correlation_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("EventStore query failed: {}", e)))?;

        let mut envelopes = Vec::new();
        for row in rows {
            let source_str: String = row.get("source");
            let source = match source_str.as_str() {
                "mcp_registry" => EventSource::McpRegistry,
                "position_generation" => EventSource::PositionGeneration,
                "candidate_matching" => EventSource::CandidateMatching,
                "dashboard_analytics" => EventSource::DashboardAnalytics,
                "gateway" => EventSource::Gateway,
                _ => EventSource::External,
            };

            envelopes.push(EventEnvelope {
                event_id: row.get("event_id"),
                event_type: row.get("event_type"),
                source,
                timestamp: row.get("timestamp"),
                payload: row.get("payload"),
                correlation_id: row.get("correlation_id"),
                causation_id: row.get("causation_id"),
                schema_version: row.get("schema_version"),
                aggregate_type: row.get("aggregate_type"),
                aggregate_id: row.get("aggregate_id"),
                organization_id: row.get("organization_id"),
            });
        }

        Ok(envelopes)
    }

    /// Update the journey/pipeline run stage based on an event envelope
    pub async fn update_pipeline_run(&self, envelope: &EventEnvelope) -> Result<(), AppError> {
        let org_id = match envelope.organization_id {
            Some(id) => id,
            None => return Ok(()), // Without organization context we cannot track RLS/multitenant pipeline runs
        };

        let correlation_id = envelope.correlation_id.unwrap_or(envelope.event_id);

        let (stage, rank) = match envelope.event_type.as_str() {
            "mcp.resolved" => ("mcp_resolved", 10),
            "position.analysis_completed" => ("needs_discovered", 20),
            "position.generated" => ("position_generated", 30),
            "candidate.invited" => ("candidate_invited", 40),
            "match.calculated" => ("match_calculated", 50),
            "report.generated" => ("report_generated", 60),
            "learning.feedback_received" => ("learning_updated", 70),
            _ => return Ok(()), // Ignore other events
        };

        sqlx::query(
            r#"
            INSERT INTO pipeline_runs (journey_id, organization_id, analysis_id, current_stage, current_stage_rank, status, last_event_id)
            VALUES ($1, $2, $1, $3, $4, 'active', $5)
            ON CONFLICT (journey_id) DO UPDATE SET
                current_stage = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank THEN EXCLUDED.current_stage ELSE pipeline_runs.current_stage END,
                current_stage_rank = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank THEN EXCLUDED.current_stage_rank ELSE pipeline_runs.current_stage_rank END,
                last_event_id = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank THEN EXCLUDED.last_event_id ELSE pipeline_runs.last_event_id END,
                completed_at = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank AND EXCLUDED.current_stage = 'report_generated' THEN NOW() ELSE pipeline_runs.completed_at END,
                status = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank AND EXCLUDED.current_stage = 'report_generated' THEN 'completed' ELSE pipeline_runs.status END
            "#
        )
        .bind(correlation_id)
        .bind(org_id)
        .bind(stage)
        .bind(rank)
        .bind(envelope.event_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("Failed to update pipeline run stage: {}", e)))?;

        Ok(())
    }
}
