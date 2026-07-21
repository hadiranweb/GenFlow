# GenFlow

GenFlow is an AI-driven platform for analyzing personality and business context to generate optimized job positions, KPIs, tasks, requirements, and match insights.

## Overview

GenFlow helps organizations move from business needs and human profiles to structured job-position recommendations. The platform combines personality analysis, business analysis, HR standards, and compliance-oriented documentation to support safer and more explainable position generation.

> GenFlow is designed as a decision-support platform. Final hiring or organizational decisions should remain under human review.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Rust, Axum |
| Database | PostgreSQL |
| Cache | Redis |
| Vector DB | Qdrant optional |
| AI | OpenAI, Anthropic Claude |
| Package Manager | pnpm |
| Containerization | Docker, Docker Compose |

## Core Features

- Personality analysis
- Business analysis
- Job position generation
- KPI and task definition
- Match scoring
- Human review workflow planning
- Compliance and fairness documentation planning
- MCP documentation scaffold for future AI/compliance modules

## Project Structure

```text
genflow/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Rust / Axum backend
├── packages/
│   ├── ui/                  # Shared UI components
│   └── db/                  # Shared database utilities
├── docs/
│   ├── architecture.md
│   ├── design-system.md
│   ├── sprint-plan.md
│   └── mcp/                 # MCP, compliance, HR, privacy and fairness docs
├── infrastructure/
│   └── docker-compose.yaml
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## MCP Documentation

The `docs/mcp` directory is used to define the documentation structure for future MCP-driven and compliance-aware capabilities.

The MCP documentation is planned sprint by sprint:

1. Legal scope and decision boundaries
2. Data inventory, privacy, and consent
3. HR analysis methodology
4. Position generation standards
5. Bias and fairness rules
6. Compliance engine design
7. Templates and schemas
8. Validation, feedback loop, and examples

In each sprint, the team first completes the relevant documentation under `docs/mcp`. If needed, the corresponding Rust-side placeholders or implementation details are then added under `apps/api/src/mcp`.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Rust stable
- Docker optional

### Clone Repository

```bash
git clone https://github.com/hadiranweb/GenFlow.git
cd GenFlow
```

### Install Dependencies

```bash
pnpm install
```

### Start Development

```bash
pnpm dev
```

The web application runs at:

```text
http://localhost:3000
```

The API service runs at:

```text
http://localhost:8080
```

## Development Commands

### Web / Monorepo

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @genflow/web build
```

### Rust API

```bash
cd apps/api
cargo fmt --check
cargo clippy -- -D warnings
cargo build
cargo test
```

## Docker

```bash
cp .env.example .env
docker compose -f infrastructure/docker-compose.yaml up -d
```

Then open:

```text
http://localhost:3000
```

## Environment

Copy the example environment file before running the full stack:

```bash
cp .env.example .env
```

Key services used by the platform:

- PostgreSQL for persistent data
- Redis for caching
- Qdrant for optional vector search
- OpenAI or Anthropic APIs for AI analysis

## Current Status

This project is under active development. The current version includes the main monorepo structure, frontend prototype, Rust API scaffold, shared UI components, and the planned MCP documentation structure for future compliance-aware development.

## License

MIT
