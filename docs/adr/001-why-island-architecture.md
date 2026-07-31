# ADR 001: Hybrid Island Architecture

## Status
Accepted (Inspired by PEMA)

## Context
Traditional monoliths degrade into tightly coupled systems where domain boundaries blur. True microservices solve this but introduce high network overhead, complex deployments, and distributed transactions issues.

## Decision
We adopt the **Hybrid Island Architecture**. Each business domain is a separate island (crate) inside a unified Rust Cargo workspace. The outer boundary is handled by a single `gateway` server. 

## Consequences
* High compilation separation and clean boundaries between domains.
* Zero-cost in-process communication through in-memory broadcast channels (Layer 1).
* Simple, single-binary containerization and deployment.
* Easy future extraction into independent microservices if required.
