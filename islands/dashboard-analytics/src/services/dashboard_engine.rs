//! Dashboard Engine — Aggregates metrics and produces dashboard views

use sqlx::PgPool;
use uuid::Uuid;
use genflow_receptors::{
    DashboardOverview, KeyMetrics, PositionAlert, AlertUrgency,
    ActivityItem, ActivityAction, DashboardAlert, AlertType,
};
use genflow_shared_infra::error::AppError;

pub struct DashboardEngine {
    pool: PgPool,
}

impl DashboardEngine {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Get dashboard overview for an organization
    pub async fn get_overview(&self, org_id: Uuid) -> Result<DashboardOverview, AppError> {
        let metrics = self.fetch_metrics(org_id).await?;
        let recent_activity = self.fetch_recent_activity(org_id).await?;
        let alerts = self.fetch_alerts(org_id).await?;

        Ok(DashboardOverview {
            organization_id: org_id,
            metrics,
            recent_activity,
            alerts,
        })
    }

    async fn fetch_metrics(&self, org_id: Uuid) -> Result<KeyMetrics, AppError> {
        // Count positions
        let total_positions: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM job_positions WHERE organization_id = $1"
        )
            .bind(org_id)
            .fetch_one(&self.pool)
            .await?;

        let active_positions: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM job_positions WHERE organization_id = $1 AND status = 'active'"
        )
            .bind(org_id)
            .fetch_one(&self.pool)
            .await?;

        // Count candidates
        let total_invited: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM position_invites WHERE position_id IN (SELECT id FROM job_positions WHERE organization_id = $1)"
        )
            .bind(org_id)
            .fetch_one(&self.pool)
            .await?;

        Ok(KeyMetrics {
            total_positions: total_positions as u32,
            active_positions: active_positions as u32,
            filled_positions: 0,
            total_candidates_invited: total_invited as u32,
            total_candidates_completed: 0,
            candidates_in_pipeline: 0,
            average_match_score: None,
            average_time_to_hire_days: None,
            positions_expiring_soon: vec![],
        })
    }

    async fn fetch_recent_activity(&self, org_id: Uuid) -> Result<Vec<ActivityItem>, AppError> {
        let rows = sqlx::query(
            "SELECT * FROM dashboard_activity WHERE organization_id = $1 ORDER BY timestamp DESC LIMIT 20"
        )
            .bind(org_id)
            .fetch_all(&self.pool)
            .await?;

        Ok(rows.iter().map(|row| ActivityItem {
            id: row.get("id"),
            actor_name: row.get("actor_name"),
            action: ActivityAction::from_db_str(row.get::<String, _>("action")),
            entity_type: row.get("entity_type"),
            entity_title: row.get("entity_title"),
            timestamp: row.get("timestamp"),
            metadata: row.get("metadata"),
        }).collect())
    }

    async fn fetch_alerts(&self, _org_id: Uuid) -> Result<Vec<DashboardAlert>, AppError> {
        // Simplified for now — would be dynamic based on real data
        Ok(vec![])
    }
}
