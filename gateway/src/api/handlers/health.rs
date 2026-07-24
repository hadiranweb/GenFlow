//! Health Check Handler

use std::sync::Arc;
use axum::extract::State;
use axum::Json;
use crate::state::AppState;
use genflow_shared_infra::health::HealthStatus;

pub async fn health_check(State(state): State<Arc<AppState>>) -> Json<HealthStatus> {
    let status = state.health_checker.check().await;
    Json(status)
}
