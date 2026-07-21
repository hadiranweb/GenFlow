//! HR Standards MCP placeholder.

use super::types::{McpCapability, McpStatus};

pub const HR_STANDARDS_MCP_ID: &str = "hr-standards-mcp";

pub fn capability() -> McpCapability {
    McpCapability {
        id: HR_STANDARDS_MCP_ID,
        name: "HR Standards MCP",
        description: "Placeholder for job description, KPI, role leveling, and HR standards extraction.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "Job Description Template",
            "KPI Template",
            "Role Leveling Standard",
            "Position Generation Standard",
        ],
    }
}
