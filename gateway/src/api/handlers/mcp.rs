//! MCP Registry Handlers

use std::sync::Arc;
use axum::extract::{State, Path};
use axum::Json;
use uuid::Uuid;
use crate::state::AppState;
use crate::error_response::ApiError;
use genflow_shared_infra::error::AppError;

pub async fn get_mcp(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<genflow_receptors::McpContext>, ApiError> {
    let mcp = state.mcp_resolver
        .find_by_id(id)
        .await
        .map_err(|e| ApiError(AppError::Infrastructure(e.to_string())))?;

    match mcp {
        Some(ctx) => Ok(Json(ctx)),
        None => Err(ApiError(AppError::NotFound(format!("MCP {} not found", id)))),
    }
}

#[derive(serde::Deserialize)]
pub struct ResolveMcpRequest {
    pub organization_id: Uuid,
    pub industry_code: Option<String>,
    pub process_codes: Vec<String>,
    pub position_hints: Vec<String>,
}

pub async fn resolve_mcp(
    State(state): State<Arc<AppState>>,
    Json(req): Json<ResolveMcpRequest>,
) -> Result<Json<genflow_receptors::McpBundle>, ApiError> {
    let analysis_id = Uuid::new_v4();

    let bundle = state.mcp_resolver
        .resolve_for_analysis(
            req.organization_id,
            req.industry_code.as_deref(),
            &req.process_codes,
            &req.position_hints,
            analysis_id,
        )
        .await
        .map_err(|e| ApiError(AppError::Infrastructure(e.to_string())))?;

    Ok(Json(bundle))
}
