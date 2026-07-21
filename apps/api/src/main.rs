//! GenFlow API Server
//!
//! A lightweight API service for job position generation.

mod api;
mod config;
mod error;

use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();

    // Get configuration
    let config = config::Config::from_env()?;

    tracing::info!("GenFlow API Starting...");
    tracing::info!("Database configured: {}", !config.database_url.is_empty());
    tracing::info!("Redis configured: {}", !config.redis_url.is_empty());
    tracing::info!("Qdrant configured: {}", !config.qdrant_url.is_empty());
    tracing::info!("OpenAI key configured: {}", config.openai_api_key.is_some());
    tracing::info!(
        "Anthropic key configured: {}",
        config.anthropic_api_key.is_some()
    );
    tracing::info!("Port: {}", config.port);

    // Build router
    let app = router();

    // Start server
    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!("Server running on http://{}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}

fn router() -> Router {
    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build routes
    Router::new()
        .route("/health", get(health_check))
        .nest("/api/v1", api::routes())
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http())
}

/// Health check endpoint
async fn health_check() -> &'static str {
    "OK"
}
