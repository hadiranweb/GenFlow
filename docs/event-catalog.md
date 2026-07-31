# Event Catalog & Schema Specifications

This catalog acts as the single source of truth for all events flowing through the GenFlow Synaptic Hub.

---

## 1. Event Envelope Schema (v1.0.0)

Every event is wrapped in an `EventEnvelope` containing crucial metadata for tracking, auditing, and correlation.

```json
{
  "event_id": "uuid",
  "event_type": "string (dot-separated, e.g., position.generated)",
  "source": "string (mcp_registry | position_generation | candidate_matching | dashboard_analytics | gateway)",
  "timestamp": "ISO-8601 string",
  "payload": {},
  "correlation_id": "uuid (identifies the business journey/session)",
  "causation_id": "uuid (identifies the event that caused this event)",
  "schema_version": "string (e.g., 1.0.0)",
  "aggregate_type": "string (e.g., position | candidate | mcp)",
  "aggregate_id": "uuid (id of the aggregate root)",
  "organization_id": "uuid (multitenant partition key)"
}
```

---

## 2. Event Register

### Category: MCP Events (`mcp.*`)

#### `mcp.resolved`
* **Source**: `mcp_registry`
* **Aggregate**: `mcp`
* **Description**: Published when a complete bundle of MCP cells is compiled and resolved for an analysis journey.
* **Payload**:
  ```json
  {
    "analysis_id": "uuid",
    "organization_id": "uuid",
    "mcp_ids": ["uuid"],
    "cache_hits": 3,
    "db_lookups": 1,
    "resolution_time_ms": 145
  }
  ```

#### `mcp.created`
* **Source**: `mcp_registry`
* **Aggregate**: `mcp`
* **Description**: Published when a new MCP Cell is registered or created.

---

### Category: Position Events (`position.*`)

#### `position.analysis_completed`
* **Source**: `position_generation`
* **Aggregate**: `position`
* **Description**: Published when the business SWOT/input analysis is finished and business needs are registered.

#### `position.generated`
* **Source**: `position_generation`
* **Aggregate**: `position`
* **Description**: Published when the main position profile is successfully written to storage.

#### `position.graph_built`
* **Source**: `position_generation`
* **Aggregate**: `position`
* **Description**: Published when the 5-axis capability graph is finalized and calibrated.

---

### Category: Candidate Events (`candidate.*`, `match.*`, `report.*`)

#### `candidate.invited`
* **Source**: `candidate_matching`
* **Aggregate**: `candidate`
* **Description**: Published when a candidate is invited to complete their profile assessments.

#### `match.calculated`
* **Source**: `candidate_matching`
* **Aggregate**: `match`
* **Description**: Published when the multi-axis matching calculations are completed.

#### `report.generated`
* **Source**: `candidate_matching`
* **Aggregate**: `report`
* **Description**: Published when the final matching report and AI explanation are written.

---

### Category: Learning Loop Events (`learning.*`)

#### `learning.feedback_received`
* **Source**: `learning_loop`
* **Aggregate**: `feedback`
* **Description**: Published when an employer reviews a match and provides dynamic accuracy ratings.

#### `learning.adaptive_weights_updated`
* **Source**: `learning_loop`
* **Aggregate**: `organization`
* **Description**: Published when an organization's multi-axis weighing model is re-calibrated based on feedback loops.
