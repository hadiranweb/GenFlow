//! Dashboard Analytics Handlers

use std::sync::Arc;
use axum::extract::{State, Path};
use axum::Json;
use uuid::Uuid;
use crate::state::AppState;
use crate::error_response::ApiError;

pub async fn get_dashboard(
    State(state): State<Arc<AppState>>,
    Path(org_id): Path<Uuid>,
) -> Result<Json<genflow_receptors::DashboardOverview>, ApiError> {
    let overview = state.dashboard_engine.get_overview(org_id).await?;
    Ok(Json(overview))
}
