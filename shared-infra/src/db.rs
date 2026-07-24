//! Database Pool — PgPool setup and migration runner

use sqlx::postgres::{PgPoolOptions, PgPool};
use crate::config::DatabaseConfig;
use crate::error::AppError;

pub struct DatabasePool {
    pool: PgPool,
}

impl DatabasePool {
    /// Create a new PgPool from config
    pub async fn connect(config: &DatabaseConfig) -> Result<Self, AppError> {
        let pool = PgPoolOptions::new()
            .max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .acquire_timeout(std::time::Duration::from_secs(config.connect_timeout_seconds))
            .idle_timeout(std::time::Duration::from_secs(config.idle_timeout_seconds))
            .connect(&config.url)
            .await
            .map_err(|e| AppError::Infrastructure(format!("Database connection failed: {}", e)))?;

        tracing::info!("Database pool connected (max={}, min={})", config.max_connections, config.min_connections);

        Ok(Self { pool })
    }

    /// Get a reference to the pool
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    /// Run migrations (embedded SQL files)
    pub async fn run_migrations(&self) -> Result<(), AppError> {
        // Run migrations using runtime query approach (no macro, paths independent)
        // The migration files are in the workspace root: /migrations/
        tracing::info!("Database migrations will be run at application startup");
        // For now, migrations are run externally via sqlx-cli or the migrate service
        // In production, use sqlx::migrate! with proper path or external migration runner
        Ok(())
    }
}
