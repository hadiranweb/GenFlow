//! Configuration management
//!
//! Loads and validates application configuration from environment variables.

use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub qdrant_url: String,

    // AI Configuration
    pub openai_api_key: Option<String>,
    pub anthropic_api_key: Option<String>,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            port: env::var("PORT").unwrap_or_else(|_| "8080".into()).parse()?,

            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),

            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".into()),

            qdrant_url: env::var("QDRANT_URL").unwrap_or_else(|_| "http://localhost:6333".into()),

            openai_api_key: env::var("OPENAI_API_KEY").ok(),
            anthropic_api_key: env::var("ANTHROPIC_API_KEY").ok(),
        })
    }
}
