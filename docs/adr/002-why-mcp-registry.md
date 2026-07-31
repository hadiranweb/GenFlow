# ADR 002: Model Context Protocol (MCP) Registry

## Status
Accepted

## Context
Generative AI models require precise business context, policies, and domain knowledge to generate useful job positions and match candidates. Directly embedding these in prompts or standard DB queries leads to bloated queries, high latency, and lack of semantic structure.

## Decision
We implement an **MCP Registry** acting as the platform's Knowledge Graph / Network Ontology. It caches and resolves hierarchical, contextual domain information ("cells") such as:
1. `PlatformPolicy`
2. `Industry`
3. `BusinessProcess`
4. `StandardPosition`
5. `OrganizationContext`

## Consequences
* Uniform representation of global standards and tenant contexts.
* Fast, layered resolution (Redis Cache -> PostgreSQL DB -> Fallback Builder).
* AI agents can query context semantically over a defined schema.
