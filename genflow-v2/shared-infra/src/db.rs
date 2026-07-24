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
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(|e| AppError::Infrastructure(format!("Migration failed: {}", e)))?;

        tracing::info!("Database migrations completed");
        Ok(())
    }
}
