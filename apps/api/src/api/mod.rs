//! API routes module
//!
//! Defines all HTTP endpoints for the API service.

mod analysis;
mod health;
mod position;

use axum::Router;

/// Create API routes
pub fn routes() -> Router {
    Router::new()
        .route("/health", axum::routing::get(health::health))
        .nest("/analyze", analysis::routes())
        .nest("/generate", position::routes())
}
