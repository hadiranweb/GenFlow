-- Synaptic Hub Event Store Schema
--
-- Inspired by PEMA Architecture for durability, event-log, inbox/outbox patterns, and event replay.

CREATE TABLE IF NOT EXISTS event_log (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL,
    correlation_id UUID,
    causation_id UUID,
    schema_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    aggregate_type VARCHAR(50),
    aggregate_id UUID,
    organization_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize queries for tracking, audit trails, and replay
CREATE INDEX IF NOT EXISTS idx_event_log_type_time ON event_log(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_event_log_correlation ON event_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_event_log_org ON event_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_log_aggregate ON event_log(aggregate_type, aggregate_id);

CREATE TABLE IF NOT EXISTS processed_events (
    event_id UUID NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, consumer_name)
);
