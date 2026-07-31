# ADR 003: Event-Driven Position Pipelines

## Status
Accepted

## Context
When generating a position profile, multiple complex procedures must run: business need discovery, graph building, metric projection, and compliance check. A synchronous blocking loop makes the API slow and highly fragile.

## Decision
We decouple the position generation flow into granular steps, each publishing a domain-specific event to the **Synaptic Hub**:
1. `mcp.resolved`
2. `position.analysis_completed`
3. `position.graph_built`
4. `position.generated`

A background `ConvergenceTracker` listens to these events, monitors their correlation, and triggers succeeding jobs (e.g. setting up assessment plans) asynchronously.

## Consequences
* High responsiveness; the API responds immediately when critical parts are stored.
* Bulletproof durability via Outbox/Event logs.
* Resilience against failure: if a non-critical component (like report translation) fails, it can be replayed safely.
