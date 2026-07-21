//! MCP registry placeholder.

use super::types::McpCapability;

pub fn draft_capabilities() -> Vec<McpCapability> {
    vec![
        super::legal::capability(),
        super::privacy::capability(),
        super::hr_standards::capability(),
        super::bias_fairness::capability(),
        super::documentation::capability(),
        super::feedback::capability(),
        super::compliance_engine::capability(),
    ]
}
