//! Position Generation Events — Published by position-generation island

use crate::events::common::{DomainEvent, EventSource};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Business analysis completed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessAnalysisCompletedEvent {
    pub analysis_id: Uuid,
    pub organization_id: Uuid,
    pub needs_discovered: u32,
    pub mcp_ids_used: Vec<Uuid>,
}

impl DomainEvent for BusinessAnalysisCompletedEvent {
    fn event_type(&self) -> &'static str {
        "position.analysis_completed"
    }
    fn source(&self) -> EventSource {
        EventSource::PositionGeneration
    }
    fn organization_id(&self) -> Option<Uuid> {
        Some(self.organization_id)
    }
    fn correlation_id(&self) -> Option<Uuid> {
        Some(self.analysis_id)
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("analysis")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.analysis_id)
    }
}

/// New position generated
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionGeneratedEvent {
    pub position_id: Uuid,
    pub organization_id: Uuid,
    pub position_code: String,
    pub title: String,
    pub generation_method: String,
    pub correlation_id: Option<Uuid>,
}

impl DomainEvent for PositionGeneratedEvent {
    fn event_type(&self) -> &'static str {
        "position.generated"
    }
    fn source(&self) -> EventSource {
        EventSource::PositionGeneration
    }
    fn organization_id(&self) -> Option<Uuid> {
        Some(self.organization_id)
    }
    fn correlation_id(&self) -> Option<Uuid> {
        self.correlation_id
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("position")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.position_id)
    }
}

/// Position graph built
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionGraphBuiltEvent {
    pub position_id: Uuid,
    pub axis_count: u32,
    pub calibration_applied: bool,
    pub correlation_id: Option<Uuid>,
}

impl DomainEvent for PositionGraphBuiltEvent {
    fn event_type(&self) -> &'static str {
        "position.graph_built"
    }
    fn source(&self) -> EventSource {
        EventSource::PositionGeneration
    }
    fn correlation_id(&self) -> Option<Uuid> {
        self.correlation_id
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("position_graph")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.position_id)
    }
}
