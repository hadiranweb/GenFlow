//! MCP Domain Submodule — Core MCP types (pure domain, no runtime)
//!
//! Runtime traits (McpRepository, McpCache, McpBuilder) live in the
//! mcp-registry island. Here we only define domain types and the
//! non-async error type.

pub mod mcp_context;
pub mod mcp_error;
pub mod mcp_builder;

pub use mcp_context::{
    McpType, McpScope, McpStatus, McpLinkType, FragmentRole,
    McpContext, McpBundle, ResolutionMetadata, McpPromptFragment, McpContextLink,
};
pub use mcp_error::McpError;
pub use mcp_builder::McpContextBuilder;
