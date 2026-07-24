//! Dashboard Analytics Handlers

use axum::extract::{State, Path};
use axum::Json;
use uuid::Uuid;
use crate::state::AppState;
use genflow_shared_infra::error::AppError;

pub async fn get_dashboard(
    State(state): State<AppState>,
    Path(org_id): Path<Uuid>,
) -> Result<Json<genflow_receptors::DashboardOverview>, AppError> {
    let overview = state.dashboard_engine.get_overview(org_id).await?;
    Ok(Json(overview))
}
