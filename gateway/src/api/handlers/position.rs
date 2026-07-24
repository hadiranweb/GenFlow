//! Position Generation Handlers

use crate::error_response::ApiError;
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::Json;
use genflow_receptors::BusinessAnalysisRequest;
use genflow_shared_infra::error::AppError;
use std::sync::Arc;
use uuid::Uuid;

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
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<genflow_receptors::JobPosition>, ApiError> {
    let position = state
        .position_engine
        .get_position(id)
        .await
        .map_err(ApiError::from)?;

    match position {
        Some(pos) => Ok(Json(pos)),
        None => Err(ApiError(AppError::NotFound(format!(
            "Position {} not found",
            id
        )))),
    }
}
