//! Bias and Fairness MCP placeholder.

use super::types::{McpCapability, McpStatus};

pub const BIAS_FAIRNESS_MCP_ID: &str = "bias-fairness-mcp";

pub fn capability() -> McpCapability {
    McpCapability {
        id: BIAS_FAIRNESS_MCP_ID,
        name: "Bias & Fairness MCP",
        description: "Placeholder for anti-bias checks, forbidden terms, and fairness review requirements.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "Anti-Bias Checklist",
            "Forbidden Terms List",
            "Fairness Review Guide",
            "Human Approval Checklist",
        ],
    }
}
