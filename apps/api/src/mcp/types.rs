//! Shared MCP placeholder types.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpCapability {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
    pub status: McpStatus,
    pub expected_outputs: &'static [&'static str],
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum McpStatus {
    Draft,
    Planned,
    Active,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpToolSpec {
    pub name: String,
    pub description: String,
    pub input_schema_ref: Option<String>,
    pub output_schema_ref: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpDocumentSpec {
    pub title: String,
    pub owner: Option<String>,
    pub status: String,
    pub notes: Option<String>,
}
