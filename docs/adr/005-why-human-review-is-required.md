# ADR 005: Human-in-the-Loop Policy for AI Hiring Decisions

## Status
Accepted (Compliance & Ethics)

## Context
Fully automated matching and rejection pipelines violate modern data privacy laws (e.g., GDPR Article 22) and increase the risk of undetected algorithmic bias or discrimination.

## Decision
GenFlow strictly enforces a **Human-in-the-Loop (HITL)** policy. AI scoring, profiling, and reports are treated strictly as **advisory decision-support signals**. Any critical action (sending job offers, final rejections, or high-risk candidate scoring) must be reviewed and explicitly signed off by a registered Business Representative.

## Consequences
* High compliance with international employment regulations and GDPR.
* Mitigation of false negatives or unfair model recommendations.
* Creation of high-quality audit logs linking automated scores to actual human decisions, creating valuable feedback for the Learning Loop.
