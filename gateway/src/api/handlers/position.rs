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

    let _ = state
        .synaptic_bus
        .publish_event(&genflow_receptors::events::BusinessAnalysisCompletedEvent {
            analysis_id: analysis_request.analysis_id,
            organization_id: analysis_request.organization_id,
            needs_discovered: profile.evidence.business_needs_used.len() as u32,
            mcp_ids_used: profile.evidence.mcp_contexts_used.clone(),
        })
        .await;

    let _ = state
        .synaptic_bus
        .publish_event(&genflow_receptors::events::PositionGraphBuiltEvent {
            position_id: profile.position.id,
            axis_count: profile.graph.axes.len() as u32,
            calibration_applied: profile
                .graph
                .axes
                .iter()
                .any(|axis| axis.calibration_applied),
        })
        .await;

    let _ = state
        .synaptic_bus
        .publish_event(&genflow_receptors::events::PositionGeneratedEvent {
            position_id: profile.position.id,
            organization_id: profile.position.organization_id,
            position_code: profile.position.position_code.clone(),
            title: profile.position.title.clone(),
            generation_method: profile.position.generation_method.as_db_str().to_string(),
        })
        .await;

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
