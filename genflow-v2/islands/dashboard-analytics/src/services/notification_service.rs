//! Notification Service — Sends notifications via multiple channels

use sqlx::PgPool;
use uuid::Uuid;
use genflow_shared_infra::error::AppError;

pub struct NotificationService {
    pool: PgPool,
}

impl NotificationService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Send a notification to a user
    pub async fn send_notification(
        &self,
        user_id: Uuid,
        notification_type: &str,
        message: &str,
        channel: &str,
    ) -> Result<Uuid, AppError> {
        let notification_id = Uuid::new_v4();

        sqlx::query(
            "INSERT INTO notifications (id, user_id, notification_type, message, channel, status) VALUES ($1, $2, $3, $4, $5, 'sent')"
        )
            .bind(notification_id)
            .bind(user_id)
            .bind(notification_type)
            .bind(message)
            .bind(channel)
            .execute(&self.pool)
            .await?;

        tracing::info!(
            notification_id = %notification_id,
            user_id = %user_id,
            channel = %channel,
            "Notification sent"
        );

        Ok(notification_id)
    }
}
