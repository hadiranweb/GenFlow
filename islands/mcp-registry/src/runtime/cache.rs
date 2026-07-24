//! RedisMcpCache — Redis implementation of McpCache trait

use async_trait::async_trait;
use redis::aio::MultiplexedConnection;
use genflow_receptors::{McpContext, McpType};
use crate::traits::{McpCache, McpRuntimeError};

pub struct RedisMcpCache {
    conn: MultiplexedConnection,
}

impl RedisMcpCache {
    pub fn new(conn: MultiplexedConnection) -> Self {
        Self { conn }
    }
}

#[async_trait]
impl McpCache for RedisMcpCache {
    async fn get(&self, key: &str) -> Result<Option<McpContext>, McpRuntimeError> {
        let result: Option<String> = redis::cmd("GET")
            .arg(key)
            .query_async(&mut self.conn.clone())
            .await
            .map_err(|e| McpRuntimeError::Cache(e.to_string()))?;

        match result {
            Some(json_str) => {
                let mcp: McpContext = serde_json::from_str(&json_str)
                    .map_err(|e| McpRuntimeError::Cache(format!("Deserialization: {}", e)))?;
                Ok(Some(mcp))
            }
            None => Ok(None),
        }
    }

    async fn set(&self, key: &str, value: &McpContext, ttl_seconds: u64) -> Result<(), McpRuntimeError> {
        let json = serde_json::to_string(value)
            .map_err(|e| McpRuntimeError::Cache(format!("Serialization: {}", e)))?;

        redis::cmd("SETEX")
            .arg(key)
            .arg(ttl_seconds)
            .arg(&json)
            .query_async::<String>(&mut self.conn.clone())
            .await
            .map_err(|e| McpRuntimeError::Cache(e.to_string()))?;

        Ok(())
    }

    async fn invalidate(&self, key: &str) -> Result<(), McpRuntimeError> {
        redis::cmd("DEL")
            .arg(key)
            .query_async::<i64>(&mut self.conn.clone())
            .await
            .map_err(|e| McpRuntimeError::Cache(e.to_string()))?;

        Ok(())
    }
}
