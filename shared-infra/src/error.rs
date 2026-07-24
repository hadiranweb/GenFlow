//! Unified Application Error Types

use axum::response::{Response, IntoResponse};
use axum::http::StatusCode;
use axum::Json;
use serde::Serialize;

/// Application error — unified across all islands
#[derive(Debug)]
pub enum AppError {
    /// Domain validation error
    Validation(String),
    /// Not found
    NotFound(String),
    /// Authorization/authentication error
    Auth(String),
    /// Infrastructure error (DB, Redis, network)
    Infrastructure(String),
    /// Business logic error
    Business(String),
    /// Internal error (shouldn't happen)
    Internal(String),
}

/// Error response body
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: String,
    pub details: Option<String>,
}

impl AppError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            Self::Validation(_) => StatusCode::BAD_REQUEST,
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Auth(_) => StatusCode::UNAUTHORIZED,
            Self::Infrastructure(_) => StatusCode::SERVICE_UNAVAILABLE,
            Self::Business(_) => StatusCode::CONFLICT,
            Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn error_code(&self) -> String {
        match self {
            Self::Validation(_) => "VALIDATION_ERROR",
            Self::NotFound(_) => "NOT_FOUND",
            Self::Auth(_) => "AUTH_ERROR",
            Self::Infrastructure(_) => "INFRASTRUCTURE_ERROR",
            Self::Business(_) => "BUSINESS_ERROR",
            Self::Internal(_) => "INTERNAL_ERROR",
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let body = ErrorResponse {
            error: self.error_code(),
            code: status.as_u16().to_string(),
            details: Some(self.to_string()),
        };
        (status, Json(body)).into_response()
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Validation(msg) => write!(f, "Validation: {}", msg),
            Self::NotFound(msg) => write!(f, "Not found: {}", msg),
            Self::Auth(msg) => write!(f, "Auth: {}", msg),
            Self::Infrastructure(msg) => write!(f, "Infrastructure: {}", msg),
            Self::Business(msg) => write!(f, "Business: {}", msg),
            Self::Internal(msg) => write!(f, "Internal: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

/// Convenience type alias
pub type AppResult<T> = Result<T, AppError>;

// From conversions
impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        Self::Infrastructure(format!("Database: {}", e))
    }
}

impl From<redis::RedisError> for AppError {
    fn from(e: redis::RedisError) -> Self {
        Self::Infrastructure(format!("Redis: {}", e))
    }
}

impl From<genflow_receptors::McpError> for AppError {
    fn from(e: genflow_receptors::McpError) -> Self {
        match e {
            genflow_receptors::McpError::Validation(msg) => Self::Validation(msg),
            genflow_receptors::McpError::NotFound(msg) => Self::NotFound(msg),
            genflow_receptors::McpError::Cache(msg) => Self::Infrastructure(msg),
            genflow_receptors::McpError::Serialization(msg) => Self::Internal(msg),
            genflow_receptors::McpError::Builder(msg) => Self::Business(msg),
        }
    }
}
