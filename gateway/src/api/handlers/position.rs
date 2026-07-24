//! Position Generation Handlers

use std::sync::Arc;
use axum::extract::{State, Path};
use axum::Json;
use uuid::Uuid;
use crate::state::AppState;
use crate::error_response::ApiError;
use genflow_shared_infra::error::AppError;
use genflow_receptors::BusinessAnalysisRequest;

#[derive(serde::Deserialize)]
pub struct GeneratePositionRequest {
    pub organization_id: Uuid,
    pub representative_id: Uuid,
    pub input_mode: genflow_receptors::BusinessInputMode,
    pub industry_code: Option<String>,
    pub process_codes: Vec<String>,
    pub position_hints: Vec<String>,
    pub representative_context: Option<genflow_receptors::RepresentativeContextInput>,
}

pub async fn generate_position(
    State(state): State<Arc<AppState>>,
    Json(req): Json<GeneratePositionRequest>,
) -> Result<Json<genflow_receptors::GeneratedPositionProfile>, ApiError> {
    let analysis_request = BusinessAnalysisRequest {
        analysis_id: Uuid::new_v4(),
        organization_id: req.organization_id,
        representative_id: req.representative_id,
        input_mode: req.input_mode,
        industry_code: req.industry_code,
        process_codes: req.process_codes,
        position_hints: req.position_hints,
        representative_context: req.representative_context,
    };

    let profile = state.position_engine.generate(&analysis_request).await?;
    Ok(Json(profile))
}

pub async fn get_position(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<Json<genflow_receptors::JobPosition>, ApiError> {
    Err(ApiError(AppError::NotFound("Position not yet implemented".to_string())))
}
