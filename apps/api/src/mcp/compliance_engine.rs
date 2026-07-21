//! Compliance Engine placeholder.

use super::types::{McpCapability, McpStatus};

pub const COMPLIANCE_ENGINE_ID: &str = "compliance-engine";

pub fn capability() -> McpCapability {
    McpCapability {
        id: COMPLIANCE_ENGINE_ID,
        name: "Compliance Engine",
        description: "Placeholder for rule evaluation across data intake and position generation steps.",
        status: McpStatus::Draft,
        expected_outputs: &[
            "Compliance Engine Requirements",
            "Compliance Rules Matrix",
            "Risk Scoring Logic",
            "Audit Log Requirements",
        ],
    }
}
