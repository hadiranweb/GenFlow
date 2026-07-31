//! Learning Loop Service — Dynamic weight adaptation based on user decisions & feedback

use genflow_shared_infra::error::AppError;
use sqlx::{PgPool, Row};
use uuid::Uuid;

pub struct LearningLoopService {
    pool: PgPool,
}

impl LearningLoopService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Record a hiring decision for model training & audit log
    pub async fn record_hiring_decision(
        &self,
        match_id: Uuid,
        decision_type: &str, // 'hired', 'rejected', 'withdrawn'
        representative_id: Uuid,
        primary_reason: &str, // 'skill_fit', 'culture_fit', 'experience_level', etc.
        notes: Option<&str>,
    ) -> Result<Uuid, AppError> {
        let decision_id = Uuid::new_v4();

        sqlx::query(
            r#"
            INSERT INTO hiring_decisions (
                id, job_match_id, decision_type, decided_by_user_id, decided_at,
                primary_reason, notes
            ) VALUES ($1, $2, $3, $4, NOW(), $5, $6)
            ON CONFLICT (job_match_id) DO UPDATE SET
                decision_type = EXCLUDED.decision_type,
                decided_by_user_id = EXCLUDED.decided_by_user_id,
                decided_at = NOW(),
                primary_reason = EXCLUDED.primary_reason,
                notes = EXCLUDED.notes
            RETURNING id
            "#
        )
        .bind(decision_id)
        .bind(match_id)
        .bind(decision_type)
        .bind(representative_id)
        .bind(primary_reason)
        .bind(notes)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("record_hiring_decision failed: {}", e)))?;

        Ok(decision_id)
    }

    /// Submit matching feedback & trigger adaptive weights optimization
    pub async fn submit_match_feedback(
        &self,
        match_id: Uuid,
        feedback_from: &str, // 'employer', 'candidate'
        accuracy_rating: i32, // 1 to 5
        prediction_accurate: bool,
        mispredicted_axes: &[String], // JSON array of axis codes, e.g. ["work_style"]
        comments: Option<&str>,
    ) -> Result<Uuid, AppError> {
        let feedback_id = Uuid::new_v4();
        let axes_json = serde_json::to_value(mispredicted_axes)
            .unwrap_or_else(|_| serde_json::json!([]));

        sqlx::query(
            r#"
            INSERT INTO match_feedback (
                id, job_match_id, feedback_from, accuracy_rating,
                prediction_accurate, mispredicted_axes, comments
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            "#
        )
        .bind(feedback_id)
        .bind(match_id)
        .bind(feedback_from)
        .bind(accuracy_rating)
        .bind(prediction_accurate)
        .bind(axes_json)
        .bind(comments)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Infrastructure(format!("submit_match_feedback failed: {}", e)))?;

        // 1. Fetch organization_id for this match
        let org_row = sqlx::query(
            "SELECT p.organization_id FROM job_matches m JOIN job_positions p ON m.position_id = p.id WHERE m.id = $1"
        )
        .bind(match_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = org_row {
            let org_id: Uuid = row.get("organization_id");
            // 2. Trigger dynamic weight tuning asynchronously
            let pool_clone = self.pool.clone();
            tokio::spawn(async move {
                if let Err(e) = Self::tune_adaptive_weights(pool_clone, org_id).await {
                    tracing::error!(error = %e, org_id = %org_id, "Adaptive weight tuning failed");
                }
            });
        }

        Ok(feedback_id)
    }

    /// Tune multi-axis weights of an organization dynamically based on collected satisfaction
    async fn tune_adaptive_weights(pool: PgPool, org_id: Uuid) -> Result<(), AppError> {
        tracing::info!(org_id = %org_id, "Tuning adaptive weights for organization");

        // Guard 1: Minimum training data count threshold
        let feedback_count_row = sqlx::query(
            r#"
            SELECT COUNT(*) FROM match_feedback f
            JOIN job_matches m ON f.job_match_id = m.id
            JOIN job_positions p ON m.position_id = p.id
            WHERE p.organization_id = $1
            "#
        )
        .bind(org_id)
        .fetch_one(&pool)
        .await?;
        
        let feedback_count: i64 = feedback_count_row.get(0);
        let min_feedback_threshold = 3;
        
        if feedback_count < min_feedback_threshold {
            tracing::info!(
                org_id = %org_id,
                current_count = %feedback_count,
                required = %min_feedback_threshold,
                "Insufficient feedback data count, skipping weight adaptation"
            );
            return Ok(());
        }

        // Fetch recent feedbacks for this organization
        let rows = sqlx::query(
            r#"
            SELECT f.accuracy_rating, f.prediction_accurate, f.mispredicted_axes
            FROM match_feedback f
            JOIN job_matches m ON f.job_match_id = m.id
            JOIN job_positions p ON m.position_id = p.id
            WHERE p.organization_id = $1
            ORDER BY f.created_at DESC
            LIMIT 50
            "#
        )
        .bind(org_id)
        .fetch_all(&pool)
        .await?;

        // Fetch current active weights or default to 0.20 for all 5 axes
        let current_weights = sqlx::query(
            r#"
            SELECT capability_weight, output_kpi_weight, business_gap_weight, work_style_weight, growth_motivation_weight
            FROM adaptive_weights_history
            WHERE organization_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            "#
        )
        .bind(org_id)
        .fetch_optional(&pool)
        .await?;

        let mut w_cap = 0.20f32;
        let mut w_kpi = 0.20f32;
        let mut w_gap = 0.20f32;
        let mut w_style = 0.20f32;
        let mut w_growth = 0.20f32;

        if let Some(row) = current_weights {
            w_cap = row.get::<sqlx::types::BigDecimal, _>("capability_weight").to_string().parse().unwrap_or(0.20);
            w_kpi = row.get::<sqlx::types::BigDecimal, _>("output_kpi_weight").to_string().parse().unwrap_or(0.20);
            w_gap = row.get::<sqlx::types::BigDecimal, _>("business_gap_weight").to_string().parse().unwrap_or(0.20);
            w_style = row.get::<sqlx::types::BigDecimal, _>("work_style_weight").to_string().parse().unwrap_or(0.20);
            w_growth = row.get::<sqlx::types::BigDecimal, _>("growth_motivation_weight").to_string().parse().unwrap_or(0.20);
        }

        // Guard 2: Strict caps and constraints on adjustment step
        let learning_rate_cap = 0.02f32; // Delta change capped at 0.02 per feedback to avoid heavy fluctuations
        let min_weight = 0.05f32;        // Clamp min weight to 5%
        let max_weight = 0.50f32;        // Clamp max weight to 50%

        let training_count = rows.len() as i32;
        let mut sum_accuracy = 0.0f32;

        for row in &rows {
            let rating: i32 = row.get("accuracy_rating");
            sum_accuracy += rating as f32 * 20.0; // scale 1-5 to 0-100%

            let mispredicted: serde_json::Value = row.get("mispredicted_axes");
            if let serde_json::Value::Array(ref axes) = mispredicted {
                for axis_val in axes {
                    if let Some(axis_str) = axis_val.as_str() {
                        // Dampen dissatisfied axes gently using the capped learning rate
                        match axis_str {
                            "capability" => w_cap = (w_cap - learning_rate_cap).max(min_weight),
                            "output_kpi" => w_kpi = (w_kpi - learning_rate_cap).max(min_weight),
                            "business_gap" => w_gap = (w_gap - learning_rate_cap).max(min_weight),
                            "work_style" => w_style = (w_style - learning_rate_cap).max(min_weight),
                            "growth_motivation" => w_growth = (w_growth - learning_rate_cap).max(min_weight),
                            _ => {}
                        }
                    }
                }
            } else {
                if row.get::<bool, _>("prediction_accurate") {
                    w_cap = (w_cap + learning_rate_cap * 0.5).min(max_weight);
                    w_style = (w_style + learning_rate_cap * 0.5).min(max_weight);
                }
            }
        }

        // Guard 3: Normalize weights so they sum perfectly to 1.0
        let total_w = w_cap + w_kpi + w_gap + w_style + w_growth;
        if total_w > 0.0 {
            w_cap /= total_w;
            w_kpi /= total_w;
            w_gap /= total_w;
            w_style /= total_w;
            w_growth /= total_w;
        }

        // Double check clamps after normalization
        w_cap = w_cap.clamp(min_weight, max_weight);
        w_kpi = w_kpi.clamp(min_weight, max_weight);
        w_gap = w_gap.clamp(min_weight, max_weight);
        w_style = w_style.clamp(min_weight, max_weight);
        w_growth = w_growth.clamp(min_weight, max_weight);

        // Normalize again after clamp
        let total_w = w_cap + w_kpi + w_gap + w_style + w_growth;
        if total_w > 0.0 {
            w_cap /= total_w;
            w_kpi /= total_w;
            w_gap /= total_w;
            w_style /= total_w;
            w_growth /= total_w;
        }

        let avg_acc = sum_accuracy / training_count as f32;

        // Persist newly calculated adaptive weights
        sqlx::query(
            r#"
            INSERT INTO adaptive_weights_history (
                id, organization_id, capability_weight, output_kpi_weight,
                business_gap_weight, work_style_weight, growth_motivation_weight,
                training_data_count, accuracy_on_training
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            "#
        )
        .bind(Uuid::new_v4())
        .bind(org_id)
        .bind(w_cap as f64)
        .bind(w_kpi as f64)
        .bind(w_gap as f64)
        .bind(w_style as f64)
        .bind(w_growth as f64)
        .bind(training_count)
        .bind(avg_acc as f64)
        .execute(&pool)
        .await?;

        tracing::info!(
            org_id = %org_id,
            w_cap = %w_cap,
            w_kpi = %w_kpi,
            w_gap = %w_gap,
            w_style = %w_style,
            w_growth = %w_growth,
            accuracy = %avg_acc,
            "Adaptive weights tuned and saved successfully"
        );

        Ok(())
    }
}
