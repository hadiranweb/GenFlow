//! Dashboard Analytics Handlers

use crate::error_response::ApiError;
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::Json;
use std::sync::Arc;
use uuid::Uuid;

pub async fn get_dashboard(
    State(state): State<Arc<AppState>>,
    Path(org_id): Path<Uuid>,
) -> Result<Json<genflow_receptors::DashboardOverview>, ApiError> {
    let overview = state.dashboard_engine.get_overview(org_id).await?;
    Ok(Json(overview))
}
