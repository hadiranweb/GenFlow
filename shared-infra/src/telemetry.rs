//! Telemetry Setup — tracing + metrics

use tracing_subscriber::{EnvFilter, fmt};
use crate::config::LoggingConfig;

/// Initialize tracing based on config
pub fn init_tracing(config: &LoggingConfig) {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(&config.level));

    match config.format {
        _ => {
            // Use pretty format for development, json for production
            fmt()
                .with_env_filter(filter)
                .with_target(true)
                .with_thread_ids(true)
                .with_file(true)
                .with_line_number(true)
                .init();
        }
    }
}
