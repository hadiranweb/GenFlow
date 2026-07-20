//! API routes module
//! 
//! Defines all HTTP endpoints for the API service.

mod health;
mod analysis;
mod position;

use axum::Router;

pub use health::*;
pub use analysis::*;
pub use position::*;

/// Create API routes
pub fn routes() -> Router {
    Router::new()
        .route("/health", axum::routing::get(health))
        .nest("/analyze", analysis::routes())
        .nest("/generate", position::routes())
}
