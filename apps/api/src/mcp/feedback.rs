//! Feedback MCP placeholder.

use super::types::{McpCapability, McpStatus};

pub const FEEDBACK_MCP_ID: &str = "feedback-mcp";

pub fn capability() -> McpCapability {
    McpCapability {
        id: FEEDBACK_MCP_ID,
        name: "Feedback MCP",
        description: "Placeholder for collecting, structuring, and converting feedback into backlog items.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "Feedback Report",
            "Change Request List",
            "Improvement Backlog",
            "Acceptance Criteria Draft",
        ],
    }
}
