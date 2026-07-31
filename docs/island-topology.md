# Island Topology (PEMA Context)

This document maps GenFlow's domain-specific components to PEMA's Super Platform Island/Cell architecture. GenFlow serves as the **Talent Intelligence Island** of a broader PEMA platform.

```
+-----------------------------------------------------------------------------------+
|                                  PEMA ECOSYSTEM                                   |
|                                                                                   |
|  +-----------------+  +-----------------+  +-----------------+  +--------------+  |
|  | Commerce Island |  | Finance Island  |  | Identity Island |  | ... Island   |  |
|  +--------+--------+  +--------+--------+  +--------+--------+  +------+-------+  |
|           |                    |                    |                  |          |
|           +--------------------+---------+----------+------------------+          |
|                                          |                                        |
|                                 [ Synaptic Hub ]                                  |
|                                          |                                        |
|                                          v                                        |
|                        +----------------------------------+                       |
|                        |    TALENT INTELLIGENCE ISLAND    |                       |
|                        |            (GenFlow)             |                       |
|                        |                                  |                       |
|                        |  +----------------------------+  |                       |
|                        |  |     MCP Registry Cell      |  |                       |
|                        |  +----------------------------+  |                       |
|                        |  |   Position Gen. Service    |  |                       |
|                        |  +----------------------------+  |                       |
|                        |  |   Candidate Match Engine   |  |                       |
|                        |  +----------------------------+  |                       |
|                        |  | Dashboard Analytics Engine |  |                       |
|                        |  +----------------------------+  |                       |
|                        |  |    Learning Loop Engine    |  |                       |
|                        |  +----------------------------+  |                       |
|                        +----------------------------------+                       |
+-----------------------------------------------------------------------------------+
```

---

## 1. GenFlow Island Map

| Island (Cargo Member) | Role / Purpose | Core Cells / Components |
|---|---|---|
| `gateway` | Boundary router, RBAC, API versioning & TLS termination | JWT auth, tenant boundary contexts |
| `mcp-registry` | Domain knowledge, constraints & policy storage | `PlatformPolicy`, `Industry`, `BusinessProcess`, `StandardPosition`, `OrganizationContext`, `CaseTemporary` |
| `position-generation` | Business Need to HR Profile translation | Business analysis parser, Position Graph generator, Calibration service |
| `candidate-matching` | Multi-axis capability valuation & matching | 5-axis match validator, interview question planner, report generator |
| `dashboard-analytics` | Projection layer for operational visibility | Log aggregator, event projections, real-time alert dispatchers |
| `learning-loop` *(new)* | feedback and adaptive weights optimization | Decision capture, feedback analytics, adaptive weights calculation |

---

## 2. Cell Topology within GenFlow

Cells in GenFlow correspond to **MCP Types**. An MCP (Model Context Protocol) is not just a context provider but an active domain-specific unit (Cell) containing behavior, validation, and rules.

```
                       +-------------------+
                       |    MCP Registry   |
                       +---------+---------+
                                 |
        +------------------------+------------------------+
        |                                                 |
        v                                                 v
+---------------+                                 +---------------+
|  Global Cells |                                 |  Tenant Cells |
|               |                                 |               |
| - Industry    |                                 | - OrgContext  |
| - Process     |                                 | - TempCases   |
| - StdPosition |                                 |               |
| - BasePolicy  |                                 |               |
+---------------+                                 +---------------+
```

* **PlatformPolicy**: Global rules (e.g. legal compliance, fair-hiring constraints).
* **Industry**: High-level market taxonomies.
* **BusinessProcess**: Workflows and capabilities required to operate processes.
* **StandardPosition**: Industry-standard definitions of job roles.
* **OrganizationContext**: Tenant-specific structures, cultures, and structures.
* **CaseTemporary**: Case-by-case ephemeral inputs (e.g., specific prompt-overrides).

---

## 3. Synaptic Topologies

All cross-island boundaries are strictly mediated via the **Synaptic Hub** utilizing standard event envelopes and structured receptors. Direct island-to-island communication is forbidden; instead, they observe events in a publish-subscribe fashion.
