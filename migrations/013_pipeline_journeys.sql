-- Pipeline Journeys Schema — tracks the lifecycle stages of hiring journeys under PEMA.

CREATE TABLE IF NOT EXISTS pipeline_runs (
    journey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    analysis_id UUID,
    current_stage VARCHAR(50) NOT NULL CHECK (current_stage IN (
        'analysis_started', 'mcp_resolved', 'needs_discovered',
        'position_generated', 'candidate_invited', 'assessment_completed',
        'match_calculated', 'report_generated', 'decision_recorded', 'learning_updated'
    )),
    current_stage_rank INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_event_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_org ON pipeline_runs(organization_id);
