//! JWT Authentication — Real implementation (no placeholder Uuid::new_v4())

use crate::config::JwtConfig;
use crate::error::AppError;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// JWT Claims — authentication payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthClaims {
    pub sub: Uuid,    // user_id
    pub org_id: Uuid, // organization_id
    pub role: String, // role (admin, analyst, representative)
    pub iss: String,  // issuer
    pub exp: i64,     // expiration timestamp
    pub iat: i64,     // issued at timestamp
}

/// JWT authentication handler
pub struct JwtAuth {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    config: JwtConfig,
}

impl JwtAuth {
    pub fn new(config: JwtConfig) -> Self {
        Self {
            encoding_key: EncodingKey::from_secret(config.secret.as_bytes()),
            decoding_key: DecodingKey::from_secret(config.secret.as_bytes()),
            config,
        }
    }

    /// Generate a JWT token for a user
    pub fn generate_token(
        &self,
        user_id: Uuid,
        org_id: Uuid,
        role: &str,
    ) -> Result<String, AppError> {
        let now = Utc::now();
        let claims = AuthClaims {
            sub: user_id,
            org_id,
            role: role.to_string(),
            iss: self.config.issuer.clone(),
            exp: (now + Duration::hours(self.config.expiration_hours as i64)).timestamp(),
            iat: now.timestamp(),
        };

        encode(&Header::default(), &claims, &self.encoding_key)
            .map_err(|e| AppError::Auth(format!("Token generation failed: {}", e)))
    }

    /// Validate a JWT token and return claims
    pub fn validate_token(&self, token: &str) -> Result<AuthClaims, AppError> {
        let mut validation = Validation::default();
        validation.set_issuer(std::slice::from_ref(&self.config.issuer));

        decode(token, &self.decoding_key, &validation)
            .map(|data| data.claims)
            .map_err(|e| AppError::Auth(format!("Token validation failed: {}", e)))
    }
}
