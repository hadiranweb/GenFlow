# Operational Semantics & Failure Modes

This document specifies the runtime, failure, and consistency guarantees of the GenFlow Talent Intelligence Island under the PEMA Architecture.

---

## 1. Domain Event & Rich Metadata (Traits over Introspection)

To guarantee reliability, metadata is **never purely derived via JSON introspection**. Instead, GenFlow implements a dual-layer approach:
1. **Trait Metadata (Source of Truth)**: The `DomainEvent` trait provides explicit default and overridden methods (`organization_id()`, `correlation_id()`, `causation_id()`, `aggregate_type()`, `aggregate_id()`).
2. **Introspection Fallback**: If an event type does not override a trait method, the engine automatically falls back to secure introspection of standard payload keys.

This prevents field-renaming and nesting bugs from corrupting the Event Backbone.

---

## 2. Journey-Centric Correlation Propagation

In GenFlow, `correlation_id` represents the **entire business journey/session** (specifically, the `analysis_id` initiated at the SWOT/gap discovery stage), not the immediate aggregate.

* **Analysis Journey Initiated**: `analysis_id = X` is generated.
* **MCP Resolved**: Event `mcp.resolved` carries `correlation_id = X`.
* **Position Generated**: Event `position.generated` carries `correlation_id = X`.
* **Candidate Invited**: Event `candidate.invited` carries `correlation_id = X`.
* **Match Calculated**: Event `match.calculated` carries `correlation_id = X`.
* **Report Generated**: Event `report.generated` carries `correlation_id = X`.

This enables the `ConvergenceTracker` to cleanly aggregate multi-island event flows under a single, unified business context.

---

## 3. Transactional Outbox Pattern

To prevent out-of-sync states between DB persistence and Synaptic Bus events, GenFlow enforces a transactional sequence on critical operations:

```
[ Domain Mutation + Outbox Append ]  -- atomically commit to PostgreSQL inside single Transaction
                 |
                 v
[ Dispatcher / Bus Publisher ]      -- reads from outbox, publishes to Tokio/Redis bus
                 |
                 v
[ Mark as Published ]               -- updates published status in DB
```

If publishing to Redis or Tokio broadcast fails, the database remains consistent, and the outbox records can be safely retried.

---

## 4. Idempotency & Safe Processing (`processed_events`)

To handle duplicate and out-of-order event flows without side effects:
* GenFlow implements a composite primary key on processed logs: `PRIMARY KEY (event_id, consumer_name)`.
* Event processing follows a strict transactional sequence:
  ```
  BEGIN TRANSACTION
  1. Check SELECT 1 FROM processed_events WHERE event_id = X AND consumer = Y;
  2. If exists, ROLLBACK & skip (Idempotency Hit).
  3. Execute Business Side-Effect.
  4. INSERT INTO processed_events (event_id, consumer_name);
  COMMIT TRANSACTION
  ```

---

## 5. Monotonic Pipeline State Machine (Stage Regression Guards)

To protect the `pipeline_runs` journey tracker against out-of-order event delivery, each stage has an assigned `rank`:

| Stage | Rank |
|---|---|
| `mcp_resolved` | 10 |
| `needs_discovered` | 20 |
| `position_generated` | 30 |
| `candidate_invited` | 40 |
| `match_calculated` | 50 |
| `report_generated` | 60 |
| `learning_updated` | 70 |

When updating the stage, the database enforces a monotonic update constraint:

```sql
UPDATE pipeline_runs
SET current_stage = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank THEN EXCLUDED.current_stage ELSE pipeline_runs.current_stage END,
    current_stage_rank = CASE WHEN EXCLUDED.current_stage_rank >= pipeline_runs.current_stage_rank THEN EXCLUDED.current_stage_rank ELSE pipeline_runs.current_stage_rank END
WHERE journey_id = $1;
```

---

## 6. Adaptive Weights Stability (Tuning Clamps & Normalization)

To prevent limited, highly subjective feedback from causing massive weight fluctuations in the AI matching engine:
1. **Feedback Threshold**: Weight updates are blocked until the organization has collected at least `min_feedback_threshold = 3` feedbacks.
2. **Delta Caps**: The absolute rate of change per feedback is clamped to a tiny step size (`learning_rate_cap = 0.02`).
3. **Strict Bounds**: Weights for each axis must stay within `[0.05, 0.50]`.
4. **Sum Constraints**: Weights are normalized back to sum to exactly `1.0` using bounded simplex projections.

---

## 7. Deep Privacy Redaction on Reports

Under legal and ethical compliance, employer-facing match reports (`ReportType::ForEmployer`) strictly **redact raw personality/psychometric answers and raw scores**. Instead, the generator translates scores into aggregated behavioral alignment summaries. Only the candidates themselves (`ReportType::ForCandidate`) have access to raw self-development dimensions.

---

## 8. Tenant Boundary Isolation (RLS Context)

All gateway endpoints extract `tenant_id` / `organization_id` from the secure JWT context. Before executing any database read or write, `set_transaction_org_context` binds the pooled connection to the active tenant. This guarantees that one tenant can never read or write another tenant's metrics, matches, or positions, even during background event processing.
