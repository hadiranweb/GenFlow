# GenFlow

A platform for job position generation using AI-driven analysis.

## Overview

GenFlow analyzes personality and business data to generate optimized job positions with KPIs, tasks, and requirements.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Rust, Axum |
| Database | PostgreSQL |
| Cache | Redis |
| Vector DB | Qdrant (optional) |
| AI | OpenAI, Anthropic Claude |

## Quick Start

### With Docker

```bash
# Clone repository
git clone https://github.com/your-org/genflow.git
cd genflow

# Setup environment
cp .env.example .env

# Start services
docker compose -f infrastructure/docker-compose.yaml up -d

# Open http://localhost:3000
```

### Development

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Project Structure

```
genflow/
├── apps/
│   ├── web/               # Next.js frontend
│   └── api/               # Rust API
├── packages/
│   └── ui/                # Shared UI components
├── infrastructure/
│   └── docker-compose.yaml
└── docs/
```

## Features

- Personality analysis
- Business analysis
- Job position generation
- KPI and task definition
- Match scoring

## License

MIT
