//! Synaptic Bus — Dual-layer event bus implementation
//!
//! tokio mpsc (in-process) + Redis pub/sub (cross-container)

use std::sync::Arc;
use tokio::sync::{mpsc, broadcast};
use genflow_receptors::events::{EventEnvelope, DomainEvent};
use genflow_shared_infra::RedisPool;
use genflow_shared_infra::error::AppError;

/// Channel capacity for the internal broadcast channel
const INTERNAL_CHANNEL_CAPACITY: usize = 1024;

/// Synaptic Bus — orchestrates event flow across islands
pub struct SynapticBus {
    /// Internal broadcast channel (Layer 1: in-process)
    internal: broadcast::Sender<EventEnvelope>,
    /// Redis connection for pub/sub (Layer 2: cross-container)
    redis: Arc<RedisPool>,
}

impl SynapticBus {
    /// Create a new Synaptic Bus
    pub fn new(redis: Arc<RedisPool>) -> Self {
        let (tx, _) = broadcast::channel(INTERNAL_CHANNEL_CAPACITY);
        Self {
            internal: tx,
            redis,
        }
    }

    /// Publish an event to both layers (tokio + Redis)
    pub async fn publish(&self, envelope: EventEnvelope) -> Result<(), AppError> {
        // Layer 1: tokio broadcast (in-process)
        self.internal.send(envelope.clone()).ok(); // silent fail if no receivers

        // Layer 2: Redis pub/sub (cross-container)
        let channel = envelope.channel_name();
        let payload = serde_json::to_string(&envelope)
            .map_err(|e| AppError::Internal(format!("Event serialization: {}", e)))?;

        redis::cmd("PUBLISH")
            .arg(&channel)
            .arg(&payload)
            .query_async::<i64>(&mut self.redis.connection().clone())
            .await
            .map_err(|e| AppError::Infrastructure(format!("Redis publish: {}", e)))?;

        tracing::debug!(
            event_type = %envelope.event_type,
            channel = %channel,
            "Event published to both layers"
        );

        Ok(())
    }

    /// Publish a domain event (auto-wraps in envelope)
    pub async fn publish_event<E: DomainEvent>(&self, event: &E) -> Result<(), AppError> {
        let envelope = event.to_envelope();
        self.publish(envelope).await
    }

    /// Subscribe to internal channel (Layer 1: in-process)
    /// Returns a broadcast receiver for the given event types
    pub fn subscribe_internal(&self) -> broadcast::Receiver<EventEnvelope> {
        self.internal.subscribe()
    }

    /// Subscribe to Redis channel (Layer 2: cross-container)
    /// Returns a pub/sub connection for the given channels
    pub async fn subscribe_redis(&self, channels: &[String]) -> Result<redis::aio::PubSub, AppError> {
        let mut pubsub = self.redis.pubsub_connection().await?;

        for channel in channels {
            pubsub.subscribe(channel).await
                .map_err(|e| AppError::Infrastructure(format!("Redis subscribe: {}", e)))?;
        }

        Ok(pubsub)
    }
}
