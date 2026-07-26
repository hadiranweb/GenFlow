//! Invitation Manager — Creates and manages position invitations for candidates

use chrono::{Duration, Utc};
use genflow_receptors::{InviteStatus, PositionInvite};
use genflow_shared_infra::error::AppError;
use sqlx::{PgPool, Row};
use uuid::Uuid;

pub struct InvitationManager {
    pool: PgPool,
}

impl InvitationManager {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Create an invitation for a position
    pub async fn create_invitation(
        &self,
        position_id: Uuid,
        invited_by_rep_id: Uuid,
        email: Option<String>,
        phone: Option<String>,
    ) -> Result<PositionInvite, AppError> {
        let invite_id = Uuid::new_v4();
        let invite_code = PositionInvite::generate_code();
        let expires_at = Utc::now() + Duration::days(7);

        sqlx::query(
            "INSERT INTO position_invites (id, position_id, invited_by_rep_id, candidate_id, invite_code, email, phone, status, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
        )
            .bind(invite_id)
            .bind(position_id)
            .bind(invited_by_rep_id)
            .bind(None::<Uuid>) // candidate_id — to be filled when accepted
            .bind(&invite_code)
            .bind(&email)
            .bind(&phone)
            .bind(InviteStatus::Created.as_db_str())
            .bind(expires_at)
            .execute(&self.pool)
            .await?;

        tracing::info!(
            invite_id = %invite_id,
            position_id = %position_id,
            code = %invite_code,
            "Invitation created"
        );

        Ok(PositionInvite {
            id: invite_id,
            position_id,
            invited_by_rep_id,
            candidate_id: None,
            invite_code,
            email,
            phone,
            status: InviteStatus::Created,
            expires_at,
        })
    }

    /// Accept an invitation (candidate registers)
    pub async fn accept_invitation(
        &self,
        invite_code: &str,
        candidate_id: Uuid,
    ) -> Result<(), AppError> {
        let mut tx = self.pool.begin().await?;

        // 1. Fetch invitation details
        let invite_row = sqlx::query(
            "SELECT email, phone FROM position_invites WHERE invite_code = $1 AND status IN ('created', 'sent')"
        )
        .bind(invite_code)
        .fetch_optional(&mut *tx)
        .await?;

        let (email, phone) = match invite_row {
            Some(row) => (
                row.get::<Option<String>, _>("email"),
                row.get::<Option<String>, _>("phone"),
            ),
            None => {
                return Err(AppError::NotFound(format!(
                    "Active invitation with code {} not found",
                    invite_code
                )));
            }
        };

        // 2. Create Candidate first to satisfy foreign key constraint
        sqlx::query(
            "INSERT INTO candidates (id, email, phone, analysis_status) VALUES ($1, $2, $3, 'registered') ON CONFLICT DO NOTHING"
        )
        .bind(candidate_id)
        .bind(&email)
        .bind(&phone)
        .execute(&mut *tx)
        .await?;

        // 3. Update the invitation row
        sqlx::query(
            "UPDATE position_invites SET candidate_id = $1, status = 'accepted', accepted_at = NOW() WHERE invite_code = $2"
        )
        .bind(candidate_id)
        .bind(invite_code)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        tracing::info!(
            candidate_id = %candidate_id,
            code = %invite_code,
            "Invitation accepted and candidate record initialized"
        );

        Ok(())
    }
}
