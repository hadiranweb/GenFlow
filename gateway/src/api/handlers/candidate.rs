//! Candidate Matching Handlers

use std::sync::Arc;
use axum::extract::{State, Path};
use axum::Json;
use uuid::Uuid;
use crate::state::AppState;
use crate::error_response::ApiError;
use genflow_shared_infra::error::AppError;

pub async fn calculate_match(
    State(state): State<Arc<AppState>>,
    Path((position_id, candidate_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<genflow_receptors::JobMatch>, ApiError> {
    let match_result = state.matching_engine.calculate_match(position_id, candidate_id).await?;
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
    let invite = state.invitation_manager.create_invitation(
        req.position_id,
        req.invited_by_rep_id,
        req.email,
        req.phone,
    ).await?;
    Ok(Json(invite))
}

pub async fn accept_invitation(
    State(state): State<Arc<AppState>>,
    Path(code): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // Candidate ID would come from auth context in real implementation
    let candidate_id = Uuid::new_v4();
    state.invitation_manager.accept_invitation(&code, candidate_id).await?;
    Ok(Json(serde_json::json!({"status": "accepted", "code": code})))
}

pub async fn generate_report(
    State(_state): State<Arc<AppState>>,
    Path(_match_id): Path<Uuid>,
) -> Result<Json<genflow_receptors::MatchReport>, ApiError> {
    Err(ApiError(AppError::NotFound("Report generation not yet fully implemented".to_string())))
}
