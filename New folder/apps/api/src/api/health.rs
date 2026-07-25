//! Health check endpoint

use axum::{http::StatusCode, Json};
use serde_json::{json, Value};

/// Health check response
/// Returns basic service status without requiring database connection
pub async fn health() -> (StatusCode, Json<Value>) {
    (
        StatusCode::OK,
        Json(json!({
            "status": "healthy",
            "version": env!("CARGO_PKG_VERSION"),
            "services": {
                "database": "configured",
                "redis": "configured"
            }
        })),
    )
}
