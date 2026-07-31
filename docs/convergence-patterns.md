# Convergence Patterns

Under the PEMA architecture, complex business flows are orchestrated through event convergence rather than tightly coupled orchestrator services. This document outlines the event convergence patterns used within GenFlow.

---

## 1. What is Event Convergence?

Event convergence occurs when **multiple related events from separate sources** arrive within a certain window of time (`timeout_seconds`), sharing a common `correlation_id` (usually the `analysis_id` or `position_id`).

When all required events in a pattern have occurred, a composite action is triggered.

---

## 2. Defined Convergence Patterns

| Pattern ID | Required Events | Action Triggered | Domain Meaning |
|---|---|---|---|
| `position_pipeline_init` | `mcp.resolved` + `position.generated` | Trigger candidate pipeline setup | A new position is fully defined, and the semantic context (MCP) is available. We can now safely instantiate matching pipelines. |
| `assessment_plan_created` | `position.generated` + `position.graph_built` | Generate assessment plan | The position and its 5-axis required capability graph are built. GenFlow can now generate the interview guide and assessment plan. |
| `match_complete_notification` | `match.calculated` + `report.generated` | Dispatch dashboard/rep notification | Both the multi-axis math and the human-readable explanation are ready. Notify the hiring manager. |
| `learning_loop_trigger` | `match.feedback_submitted` + `hiring_decision.recorded` | Update adaptive weights | A representative has made a hire or submitted feedback. Recalculate weights. |

---

## 3. Mathematical Formula for Adaptive Tuning

When a `learning_loop_trigger` pattern converges, the feedback signal updates the multi-axis weights of an organization dynamically.

Given the old weight vector $W = [w_{cap}, w_{kpi}, w_{gap}, w_{style}, w_{grow}]$ and a feedback satisfaction score $S_{axis} \in [-1.0, 1.0]$:

$$w'_{axis} = w_{axis} + \alpha \cdot S_{axis} \cdot e^{-\lambda \cdot t}$$

Where:
* $\alpha$ is the learning rate (typically `0.05`).
* $S_{axis}$ is the satisfaction feedback for that specific axis.
* $e^{-\lambda \cdot t}$ is a decay factor for older training inputs.

The weights are then normalized so that $\sum w' = 1.0$.
