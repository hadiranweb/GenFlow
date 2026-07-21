//! Privacy MCP placeholder.

use super::types::{McpCapability, McpStatus};

pub const PRIVACY_MCP_ID: &str = "privacy-mcp";

pub fn capability() -> McpCapability {
    McpCapability {
        id: PRIVACY_MCP_ID,
        name: "Privacy MCP",
        description: "Placeholder for privacy, consent, AI disclosure, and data retention requirements.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "Privacy Notice",
            "Consent Text",
            "AI Usage Disclosure",
            "Data Retention Rules",
        ],
    }
}
