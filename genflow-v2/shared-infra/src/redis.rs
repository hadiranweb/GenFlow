//! Redis Pool — Connection and pub/sub helpers

use redis::aio::MultiplexedConnection;
use redis::Client;
use crate::config::RedisConfig;
use crate::error::AppError;

pub struct RedisPool {
    client: Client,
    connection: MultiplexedConnection,
}

impl RedisPool {
    /// Create Redis connection from config
    pub async fn connect(config: &RedisConfig) -> Result<Self, AppError> {
        let client = Client::open(config.url.clone())
            .map_err(|e| AppError::Infrastructure(format!("Redis client creation failed: {}", e)))?;

        let connection = client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| AppError::Infrastructure(format!("Redis connection failed: {}", e)))?;

        tracing::info!("Redis pool connected to {}", config.url);

        Ok(Self { client, connection })
    }

    /// Get a reference to the async connection
    pub fn connection(&self) -> &MultiplexedConnection {
        &self.connection
    }

    /// Get the client (for creating new pub/sub connections)
    pub fn client(&self) -> &Client {
        &self.client
    }

    /// Create a new pub/sub connection for event consumption
    pub async fn pubsub_connection(&self) -> Result<redis::aio::PubSub, AppError> {
        let pubsub = self.client
            .get_async_pubsub()
            .await
            .map_err(|e| AppError::Infrastructure(format!("Redis pub/sub connection failed: {}", e)))?;

        Ok(pubsub)
    }

    /// Ping check for health
    pub async fn ping(&self) -> Result<(), AppError> {
        redis::cmd("PING")
            .query_async::<String>(&mut self.connection.clone())
            .await
            .map_err(|e| AppError::Infrastructure(format!("Redis ping failed: {}", e)))?;
        Ok(())
    }
}
