//! Legal MCP placeholder.

use super::types::{McpCapability, McpStatus};

pub const LEGAL_MCP_ID: &str = "legal-mcp";

pub fn capability() -> McpCapability {
    McpCapability {
        id: LEGAL_MCP_ID,
        name: "Legal MCP",
        description: "Placeholder for legal scope, legislation mapping, and legal risk extraction.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "Legal Scope Document",
            "Legal Risk Register",
            "Compliance Obligations List",
        ],
    }
}
