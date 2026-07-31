//! Common event types and envelope

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Source of an event (which island produced it)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EventSource {
    McpRegistry,
    PositionGeneration,
    CandidateMatching,
    DashboardAnalytics,
    Gateway,
    External,
}

impl EventSource {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::McpRegistry => "mcp_registry",
            Self::PositionGeneration => "position_generation",
            Self::CandidateMatching => "candidate_matching",
            Self::DashboardAnalytics => "dashboard_analytics",
            Self::Gateway => "gateway",
            Self::External => "external",
        }
    }
}

/// Event envelope — wraps any domain event with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope {
    pub event_id: Uuid,
    pub event_type: String,
    pub source: EventSource,
    pub timestamp: DateTime<Utc>,
    pub payload: serde_json::Value,
    pub correlation_id: Option<Uuid>,
    pub causation_id: Option<Uuid>,
    pub schema_version: String,
    pub aggregate_type: Option<String>,
    pub aggregate_id: Option<Uuid>,
    pub organization_id: Option<Uuid>,
}

impl EventEnvelope {
    pub fn new(
        source: EventSource,
        event_type: impl Into<String>,
        payload: serde_json::Value,
    ) -> Self {
        Self {
            event_id: Uuid::new_v4(),
            event_type: event_type.into(),
            source,
            timestamp: Utc::now(),
            payload,
            correlation_id: None,
            causation_id: None,
            schema_version: "1.0.0".to_string(),
            aggregate_type: None,
            aggregate_id: None,
            organization_id: None,
        }
    }

    pub fn with_correlation_id(mut self, id: Uuid) -> Self {
        self.correlation_id = Some(id);
        self
    }

    pub fn with_causation_id(mut self, id: Uuid) -> Self {
        self.causation_id = Some(id);
        self
    }

    pub fn with_schema_version(mut self, version: impl Into<String>) -> Self {
        self.schema_version = version.into();
        self
    }

    pub fn with_aggregate(mut self, agg_type: impl Into<String>, agg_id: Uuid) -> Self {
        self.aggregate_type = Some(agg_type.into());
        self.aggregate_id = Some(agg_id);
        self
    }

    pub fn with_organization_id(mut self, org_id: Uuid) -> Self {
        self.organization_id = Some(org_id);
        self
    }

    /// Redis channel name for pub/sub routing
    pub fn channel_name(&self) -> String {
        format!("genflow:events:{}", self.event_type)
    }
}

/// Trait for domain events that can be serialized into an envelope
pub trait DomainEvent: Serialize {
    fn event_type(&self) -> &'static str;
    fn source(&self) -> EventSource;

    fn to_envelope(&self) -> EventEnvelope {
        let payload = serde_json::to_value(self).unwrap_or(serde_json::json!({}));
        let mut envelope = EventEnvelope::new(
            self.source(),
            self.event_type(),
            payload.clone(),
        );

        // Extract organization_id if present
        if let Some(org_id_val) = payload.get("organization_id").and_then(|v| v.as_str()) {
            if let Ok(org_id) = Uuid::parse_str(org_id_val) {
                envelope.organization_id = Some(org_id);
            }
        }

        // Extract correlation_id or analysis_id as correlation_id
        if let Some(corr_id_val) = payload.get("correlation_id").and_then(|v| v.as_str()) {
            if let Ok(corr_id) = Uuid::parse_str(corr_id_val) {
                envelope.correlation_id = Some(corr_id);
            }
        } else if let Some(analysis_id_val) = payload.get("analysis_id").and_then(|v| v.as_str()) {
            if let Ok(analysis_id) = Uuid::parse_str(analysis_id_val) {
                envelope.correlation_id = Some(analysis_id);
            }
        }

        // Extract aggregate_type and aggregate_id
        let (agg_type, agg_id_field) = match self.event_type() {
            t if t.starts_with("mcp") => ("mcp", "mcp_id"),
            t if t.starts_with("position") => ("position", "position_id"),
            t if t.starts_with("candidate") => ("candidate", "candidate_id"),
            t if t.starts_with("match") => ("match", "match_id"),
            t if t.starts_with("report") => ("report", "report_id"),
            _ => ("generic", "id"),
        };

        if let Some(agg_id_val) = payload.get(agg_id_field).and_then(|v| v.as_str()) {
            if let Ok(agg_id) = Uuid::parse_str(agg_id_val) {
                envelope.aggregate_type = Some(agg_type.to_string());
                envelope.aggregate_id = Some(agg_id);
            }
        }

        envelope
    }
}
