//! Candidate Matching Events — Published by candidate-matching island

use crate::events::common::{DomainEvent, EventSource};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Candidate invited to a position
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CandidateInvitedEvent {
    pub invite_id: Uuid,
    pub position_id: Uuid,
    pub candidate_id: Option<Uuid>,
    pub email: Option<String>,
    pub organization_id: Option<Uuid>,
    pub correlation_id: Option<Uuid>,
}

impl DomainEvent for CandidateInvitedEvent {
    fn event_type(&self) -> &'static str {
        "candidate.invited"
    }
    fn source(&self) -> EventSource {
        EventSource::CandidateMatching
    }
    fn organization_id(&self) -> Option<Uuid> {
        self.organization_id
    }
    fn correlation_id(&self) -> Option<Uuid> {
        self.correlation_id
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("candidate_invite")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.invite_id)
    }
}

/// Match calculated
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchCalculatedEvent {
    pub match_id: Uuid,
    pub position_id: Uuid,
    pub candidate_id: Uuid,
    pub composite_score: f32,
    pub human_review_required: bool,
    pub organization_id: Option<Uuid>,
    pub correlation_id: Option<Uuid>,
}

impl DomainEvent for MatchCalculatedEvent {
    fn event_type(&self) -> &'static str {
        "match.calculated"
    }
    fn source(&self) -> EventSource {
        EventSource::CandidateMatching
    }
    fn organization_id(&self) -> Option<Uuid> {
        self.organization_id
    }
    fn correlation_id(&self) -> Option<Uuid> {
        self.correlation_id
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("match")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.match_id)
    }
}

/// Report generated
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportGeneratedEvent {
    pub report_id: Uuid,
    pub match_id: Uuid,
    pub report_type: String,
    pub organization_id: Option<Uuid>,
    pub correlation_id: Option<Uuid>,
}

impl DomainEvent for ReportGeneratedEvent {
    fn event_type(&self) -> &'static str {
        "report.generated"
    }
    fn source(&self) -> EventSource {
        EventSource::CandidateMatching
    }
    fn organization_id(&self) -> Option<Uuid> {
        self.organization_id
    }
    fn correlation_id(&self) -> Option<Uuid> {
        self.correlation_id
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("match_report")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.report_id)
    }
}

/// Match feedback received
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchFeedbackReceivedEvent {
    pub match_id: Uuid,
    pub feedback_from: String,
    pub accuracy_rating: u32,
    pub prediction_accurate: bool,
    pub organization_id: Option<Uuid>,
    pub correlation_id: Option<Uuid>,
}

impl DomainEvent for MatchFeedbackReceivedEvent {
    fn event_type(&self) -> &'static str {
        "learning.feedback_received"
    }
    fn source(&self) -> EventSource {
        EventSource::CandidateMatching
    }
    fn organization_id(&self) -> Option<Uuid> {
        self.organization_id
    }
    fn correlation_id(&self) -> Option<Uuid> {
        self.correlation_id
    }
    fn aggregate_type(&self) -> Option<&'static str> {
        Some("feedback")
    }
    fn aggregate_id(&self) -> Option<Uuid> {
        Some(self.match_id)
    }
}
