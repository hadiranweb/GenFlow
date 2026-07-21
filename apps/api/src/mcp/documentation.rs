//! Documentation MCP placeholder.

use super::types::{McpCapability, McpStatus};

pub const DOCUMENTATION_MCP_ID: &str = "documentation-mcp";

pub fn capability() -> McpCapability {
    McpCapability {
        id: DOCUMENTATION_MCP_ID,
        name: "Documentation MCP",
        description: "Placeholder for generating PRD, technical requirements, user flows, and risk registers.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "PRD",
            "Technical Requirements",
            "User Flow",
            "Compliance Document",
            "Risk Register",
        ],
    }
}
