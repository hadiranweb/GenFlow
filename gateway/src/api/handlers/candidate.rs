//! Candidate Matching Handlers

use crate::error_response::ApiError;
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::Json;
use genflow_shared_infra::error::AppError;
use sqlx::Row;
use std::sync::Arc;
use uuid::Uuid;

pub async fn calculate_match(
    State(state): State<Arc<AppState>>,
    Path((position_id, candidate_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<genflow_receptors::JobMatch>, ApiError> {
    let match_result = state
        .matching_engine
        .calculate_match(position_id, candidate_id)
        .await?;
    Ok(Json(match_result))
}

#[derive(serde::Deserialize)]
pub struct CreateInvitationRequest {
    pub position_id: Uuid,
    pub invited_by_rep_id: Uuid,
    pub email: Option<String>,
    pub phone: Option<String>,
}

pub async fn create_invitation(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateInvitationRequest>,
) -> Result<Json<genflow_receptors::PositionInvite>, ApiError> {
    let invite = state
        .invitation_manager
        .create_invitation(req.position_id, req.invited_by_rep_id, req.email, req.phone)
        .await?;
    Ok(Json(invite))
}

pub async fn accept_invitation(
    State(state): State<Arc<AppState>>,
    Path(code): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // Candidate ID would come from auth context in real implementation
    let candidate_id = Uuid::new_v4();
    state
        .invitation_manager
        .accept_invitation(&code, candidate_id)
        .await?;
    Ok(Json(serde_json::json!({
        "status": "accepted",
        "code": code
    })))
}

pub async fn generate_report(
    State(state): State<Arc<AppState>>,
    Path(match_id): Path<Uuid>,
) -> Result<Json<genflow_receptors::MatchReport>, ApiError> {
    // Load the match from DB to get its details
    let row = sqlx::query(
        "SELECT id, position_id, candidate_id, composite_match_index, confidence_score, status, human_review_required FROM job_matches WHERE id = $1"
    )
        .bind(match_id)
        .fetch_optional(&state.db_pool)
        .await
        .map_err(|e| ApiError(AppError::Infrastructure(e.to_string())))?;

    match row {
        Some(row) => {
            let job_match = genflow_receptors::JobMatch {
                id: row.get("id"),
                position_id: row.get("position_id"),
                candidate_id: row.get("candidate_id"),
                capability_match: genflow_receptors::AxisMatch {
                    axis_code: "capability".to_string(),
                    match_percentage: genflow_receptors::Score::new_unchecked(0.0), // placeholder — would need JSONB parsing
                    gap_severity: genflow_receptors::GapSeverity::Aligned,
                    details: vec![],
                },
                output_kpi_match: genflow_receptors::AxisMatch {
                    axis_code: "output_kpi".to_string(),
                    match_percentage: genflow_receptors::Score::new_unchecked(0.0),
                    gap_severity: genflow_receptors::GapSeverity::Aligned,
                    details: vec![],
                },
                business_gap_match: genflow_receptors::AxisMatch {
                    axis_code: "business_gap".to_string(),
                    match_percentage: genflow_receptors::Score::new_unchecked(0.0),
                    gap_severity: genflow_receptors::GapSeverity::Aligned,
                    details: vec![],
                },
                work_style_alignment: genflow_receptors::AxisMatch {
                    axis_code: "work_style".to_string(),
                    match_percentage: genflow_receptors::Score::new_unchecked(0.0),
                    gap_severity: genflow_receptors::GapSeverity::Aligned,
                    details: vec![],
                },
                growth_motivation_match: genflow_receptors::AxisMatch {
                    axis_code: "growth_motivation".to_string(),
                    match_percentage: genflow_receptors::Score::new_unchecked(0.0),
                    gap_severity: genflow_receptors::GapSeverity::Aligned,
                    details: vec![],
                },
                composite_index: genflow_receptors::Score::new_unchecked(
                    row.get::<f32, _>("composite_match_index"),
                ),
                confidence_score: genflow_receptors::Score::new_unchecked(
                    row.get::<f32, _>("confidence_score"),
                ),
                status: genflow_receptors::MatchStatus::from_db_str(
                    &row.get::<String, _>("status"),
                )
                .unwrap_or(genflow_receptors::MatchStatus::PendingReview),
                human_review_required: row.get("human_review_required"),
                calculated_at: row.get("calculated_at"),
            };

            let report = state
                .report_generator
                .generate(&job_match, genflow_receptors::ReportType::ForEmployer)
                .await?;
            Ok(Json(report))
        }
        None => Err(ApiError(AppError::NotFound(format!(
            "Match {} not found",
            match_id
        )))),
    }
}
