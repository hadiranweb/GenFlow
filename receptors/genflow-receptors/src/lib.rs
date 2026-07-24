//! genflow-receptors — Shared domain types and event definitions
//!
//! Pure Rust types with NO database or async dependencies.
//! Every island and the gateway depends on this crate.
//!
//! Inspired by pema-platform-v2's "rust-commons" receptor concept.
//!
//! ## Module Structure
//! - `domain` — Business domain types (Score, MCP, Position, Candidate, etc.)
//! - `events` — Domain event definitions for the Synaptic Hub

pub mod domain;
pub mod events;

// Convenient re-exports
pub use domain::{
    score::Score,
    mcp::{
        McpType, McpScope, McpStatus, McpLinkType, FragmentRole,
        McpContext, McpBundle, ResolutionMetadata, McpPromptFragment, McpContextLink,
        McpError, McpContextBuilder,
    },
    business_need::{BusinessNeed, BusinessNeedType, NeedUrgency},
    position_generation::{
        BusinessAnalysisRequest, BusinessInputMode, CapabilityLevel,
        RepresentativeContextInput, PositionHypothesis, AxisWeights,
        StandardPositionMatch, PositionGraph, PositionGraphAxis, AxisCode,
        DimensionRequirement, PositionRequirement, RequirementType,
        RequirementImportance, RequirementSource, GeneratedPositionProfile,
        JobPosition, PositionGenerationMethod, PositionStatus,
        PositionGenerationEvidence, GenerationWarning, WarningSeverity,
        BusinessAnalysisResult,
    },
    representative::{
        RepresentativeRelation, RepresentativeInfluencePolicy, PolicyError,
    },
    candidate::{
        Candidate, CandidateStatus, PositionInvite, InviteStatus,
    },
    job_match::{
        JobMatch, AxisMatch, DimensionMatchDetail, GapSeverity,
        MatchStatus, MatchReport, ReportType, RiskFlag, FlagSeverity,
    },
    assessment::{
        CandidateProfile, BigFiveScores, RiasecScores, AssessmentMethod,
    },
    dashboard::{
        DashboardOverview, KeyMetrics, PositionAlert, AlertUrgency,
        ActivityItem, ActivityAction, PositionDashboardDetail, PositionSummary,
        PipelineStats, MatchSummary, RiskLevel, DashboardAlert, AlertType,
    },
};
