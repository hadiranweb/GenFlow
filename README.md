# GenFlow v2 — Business-First Position Generation & Candidate Matching Platform

> **Hybrid Island Architecture** — 8 Rust crates, single deploy, zero GC pauses.

[![CI/CD](https://github.com/hadiranweb/GenFlow/actions/workflows/ci-cd.yml/badge.svg?branch=v2-island-architecture)](https://github.com/hadiranweb/GenFlow/actions/workflows/ci-cd.yml)
[![License: PROPRIETARY](https://img.shields.io/badge/License-PROPRIETARY-red.svg)](./LICENSE)

---

## 🎯 What is GenFlow?

GenFlow transforms **business analysis input** (SWOT, Gap Analysis, Direct Request) into **structured position profiles** with a 5-axis matching engine, then matches candidates against those positions using capability, output KPI, business gap, work style, and growth motivation dimensions.

### Key Differentiators

| Feature | v1 (Sprint 1-5) | v2 (Island Architecture) |
|---------|------------------|--------------------------|
| Architecture | Monolithic `apps/api/src/` | 8 Cargo workspace crates |
| Event Bus | None | Synaptic Hub (tokio + Redis) |
| Auth | Placeholder (`Uuid::new_v4()`) | Real JWT with validation |
| MCP Resolution | N/A | Cache → DB → Build fallback |
| Position Generation | Basic CRUD | 5-axis graph + representative calibration |
| Candidate Matching | None | 5-Axis Matching Engine |
| Domain Types | Mixed with runtime | Receptors (pure) + Runtime (async) |
| CI/CD | Cache issues | Workspace-aware Docker + proper layers |
| Dashboard | Basic | Metrics + Alerts + Notifications |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│             Gateway (Axum HTTP API)           │
│     ┌────────┬─────────┬─────────┬──────┐   │
│     │ MCP    │ Position│ Candidate│ Dash │   │
│     │ Routes │ Routes  │ Routes   │Routes│   │
│     └────────┴─────────┴─────────┴──────┘   │
│              ┌─── AppState ───┐              │
└──────────────┼────────────────┼─────────────┘
               │                │
┌──────────────┼────────────────┼─────────────┐
│           Islands (lib crates)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ MCP Reg  │ │ Position │ │ Candidate    │ │
│  │ Registry │ │   Gen    │ │   Matching   │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│           ┌──────────┐                       │
│           │ Dashboard│                       │
│           └──────────┘                       │
└─────────────────────────────────────────────┘
               │
┌──────────────┼─────────────────────────────┐
│        Synaptic Hub (dual-layer bus)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ tokio    │  │  Redis   │  │ Converge │ │
│  │ broadcast│  │  pub/sub │  │ Tracker  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────┘
               │
┌──────────────┼─────────────────────────────┐
│  Receptors (shared domain types)            │
│  Score · MCP · Position · Match · Events   │
└─────────────────────────────────────────────┘
               │
┌──────────────┼─────────────────────────────┐
│  Shared Infra                               │
│  DB · Redis · Auth · Error · Config · Health│
└─────────────────────────────────────────────┘
```

**Full architecture documentation:** [`docs/architecture.md`](./docs/architecture.md)

---

## 📦 Workspace Crates

| Crate | Role | Key Types |
|-------|------|-----------|
| `genflow-receptors` | Pure domain types + events | `Score`, `McpContext`, `JobPosition`, `JobMatch`, `BusinessInputMode` |
| `genflow-shared-infra` | Infrastructure utilities | `RedisPool`, `DatabasePool`, `JwtAuth`, `AppError`, `AppConfig` |
| `genflow-synaptic-hub` | Dual-layer event bus | `SynapticBus`, `EventRouter`, `ConvergenceTracker` |
| `genflow-mcp-registry` | MCP Cell runtime | `McpResolver`, `RedisMcpCache`, `PgMcpRepository`, `McpBuilderImpl` |
| `genflow-position-generation` | Position pipeline | `PositionGenerationEngine`, `BusinessNeedDiscovery`, `PositionGraphBuilder`, `RepresentativeCalibrator` |
| `genflow-candidate-matching` | 5-Axis matching | `MatchingEngine`, `InvitationManager`, `ReportGenerator` |
| `genflow-dashboard-analytics` | Dashboard + notifications | `DashboardEngine`, `NotificationService` |
| `genflow-gateway` | API entry point (binary) | `AppState`, `ApiError` (IntoResponse bridge) |

---

## 🚀 Quick Start

### Prerequisites
- Rust 1.75+ (`rustup update stable`)
- PostgreSQL 16
- Redis 7

### Run Locally

```bash
# 1. Clone
git clone https://github.com/hadiranweb/GenFlow.git
cd GenFlow
git checkout v2-island-architecture

# 2. Start infrastructure
docker-compose up -d db redis

# 3. Run migrations (via sqlx-cli)
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run --source migrations

# 4. Build & run
cargo run --release -p genflow-gateway
```

### Run with Docker Compose

```bash
docker-compose up -d
# API available at http://localhost:3000
# Health: http://localhost:3000/health
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_HOST` | `0.0.0.0` | HTTP server host |
| `SERVER_PORT` | `3000` | HTTP server port |
| `DATABASE_URL` | `postgres://genflow:genflow@localhost:5432/genflow` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | `genflow-dev-secret-change-in-production` | JWT signing key |
| `JWT_EXPIRATION_HOURS` | `24` | Token lifetime |
| `LOG_LEVEL` | `info` | Tracing level |
| `LOG_FORMAT` | `pretty` | `pretty` or `json` |

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check (DB + Redis) |
| `GET` | `/api/v2/mcp/{id}` | Get MCP context by ID |
| `POST` | `/api/v2/mcp/resolve` | Resolve MCP bundle for analysis |
| `POST` | `/api/v2/positions/generate` | Generate position from business input |
| `GET` | `/api/v2/positions/{id}` | Get position by ID |
| `GET` | `/api/v2/matches/{position_id}/{candidate_id}` | Calculate 5-axis match |
| `POST` | `/api/v2/invitations` | Create candidate invitation |
| `POST` | `/api/v2/invitations/{code}/accept` | Accept invitation |
| `GET` | `/api/v2/reports/{match_id}` | Get match report |
| `GET` | `/api/v2/dashboard/{org_id}` | Get organization dashboard |

### Example: Generate Position (SWOT)

```json
POST /api/v2/positions/generate
{
  "organization_id": "uuid...",
  "representative_id": "uuid...",
  "input_mode": {
    "swot": {
      "strengths": ["Strong brand"],
      "weaknesses": ["No digital presence"],
      "opportunities": ["E-commerce expansion"],
      "threats": ["Market competition"]
    }
  },
  "industry_code": "retail",
  "process_codes": ["inventory_management"],
  "position_hints": ["digital_marketing_specialist"]
}
```

---

## 🧪 Testing

```bash
# Unit tests only (no DB required)
cargo test --workspace --lib

# All tests (requires PostgreSQL + Redis running)
cargo test --workspace

# Single crate
cargo test -p genflow-receptors
```

---

## 📊 MCP Resolution Flow

```
Request → Cache (Redis) → Database (PostgreSQL) → Build (fallback)
              ↓ HIT              ↓ HIT              ↓ DRAFT
           Return MCP        Return MCP        Generate draft MCP
              ↓                ↓                ↓
          Cache populate    Cache populate    Cache populate
```

Each MCP Type has its own Cell with distinct TTL:

| Cell | Scope | TTL | Reusable |
|------|-------|-----|----------|
| `PlatformPolicy` | Global | 7 days | ✅ |
| `Industry` | Global/Industry | 24h | ✅ |
| `BusinessProcess` | Global/Industry | 24h | ✅ |
| `StandardPosition` | Global/Industry | 24h | ✅ |
| `OrganizationContext` | Tenant | 1h | ✅ |
| `CaseTemporary` | Case | 30m | ❌ |

---

## 🔄 Event Flow (Synaptic Hub)

```
mcp.resolved        → Position Generation, Dashboard
position.generated  → Candidate Matching, Dashboard
candidate.invited   → Dashboard
match.calculated    → Dashboard
dashboard.alert_triggered → Gateway
```

Convergence patterns detect correlated events:
- **mcp.resolved + position.generated → candidate pipeline setup**
- **match.calculated + report.generated → dashboard notification**

---

## 📜 Migration from v1

GenFlow v2 is a **complete rewrite** of the v1 Sprint architecture, but preserves:

- ✅ All 7 SQL migration files (1,301 lines)
- ✅ Domain concepts and naming conventions
- ✅ Organization → Position → Candidate flow
- ✅ MCP as the core context protocol
- ✅ Representative influence policy (calibration only affects Work Style axis)

**What changed:**
- Monolith → Island workspace
- No events → Synaptic Hub dual-layer bus
- Placeholder auth → Real JWT
- No matching engine → 5-Axis engine with risk flags
- No dashboard → Full dashboard with alerts and notifications

See [`CHANGELOG.md`](./CHANGELOG.md) for detailed changes.

---

## 📁 Project Structure

```
genflow-v2/
├── Cargo.toml                          # Workspace root
├── Cargo.lock                           # Locked dependencies
├── .github/workflows/ci-cd.yml          # CI/CD pipeline
├── Dockerfile                           # Multi-stage, workspace-aware
├── docker-compose.yml                   # api + db + redis + migrate
├── README.md                            # This file
├── CHANGELOG.md                         # Version history
├── CONTRIBUTING.md                      # Development guidelines
├── docs/
│   └── architecture.md                  # Full architecture docs
│
├── receptors/genflow-receptors/         # Shared domain types (pure Rust)
│   └── src/
│       ├── domain/                      # Score, MCP, Position, Match, etc.
│       └── events/                      # Event definitions for Synaptic Hub
│
├── shared-infra/                        # DB, Redis, Auth, Config, Error
│   └── src/
│       ├── config.rs                    # AppConfig from env vars
│       ├── db.rs                        # PgPool setup
│       ├── redis.rs                     # Async Redis pool
│       ├── auth.rs                      # JWT encode/decode
│       ├── error.rs                     # AppError (pure domain, no axum)
│       ├── telemetry.rs                 # tracing setup
│       └── health.rs                    # DB + Redis health checks
│
├── synaptic-hub/                        # Dual-layer event bus
│   └── src/
│       ├── bus.rs                       # tokio broadcast + Redis pub/sub
│       ├── router.rs                    # Event pattern routing
│       └── convergence.rs               # Multi-source event aggregation
│
├── islands/
│   ├── mcp-registry/                    # MCP Cell runtime
│   │   └── src/
│   │       ├── traits.rs                # McpRepository, McpCache, McpBuilder
│   │       └── runtime/
│   │           ├── repository.rs        # PgMcpRepository
│   │           ├── cache.rs             # RedisMcpCache
│   │           ├── builder.rs           # McpBuilderImpl
│   │           └── resolver.rs          # McpResolver (Cache → DB → Build)
│   │
│   ├── position-generation/             # Position generation pipeline
│   │   └── src/services/
│   │       ├── business_need_discovery.rs
│   │       ├── position_graph_builder.rs
│   │       ├── representative_calibrator.rs
│   │       ├── business_analysis_engine.rs
│   │       └── position_generation_engine.rs
│   │
│   ├── candidate-matching/              # 5-Axis matching
│   │   └── src/services/
│   │       ├── matching_engine.rs       # Core algorithm
│   │       ├── invitation_manager.rs    # Candidate invitations
│   │       └── report_generator.rs      # Employer + Candidate reports
│   │
│   ├── dashboard-analytics/             # Dashboard + notifications
│   │   └── src/services/
│   │       ├── dashboard_engine.rs      # Metrics aggregation
│   │       └── notification_service.rs  # Multi-channel notifications
│
├── gateway/                             # Axum API binary
│   └── src/
│       ├── main.rs                      # Server entry point
│       ├── state.rs                     # AppState composition root
│       ├── error_response.rs            # AppError → axum IntoResponse bridge
│       └── api/
│           ├── routes.rs                # Router composition
│           └── handlers/                # Per-island handlers
│
└── migrations/                          # 7 SQL files from v1 (1,301 lines)
    ├── 001_organizations.sql
    ├── 002_reference_tables.sql
    ├── 003_mcp_registry.sql
    ├── 004_position_generation.sql
    ├── 005_candidate_matching.sql
    ├── 006_dashboard_analytics.sql
    └── 007_seed_data.sql
```

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development setup, coding standards, and PR guidelines.

---

## 📄 License

PROPRIETARY — © hadiranweb. See [`LICENSE`](./LICENSE) for details.

---

**Built with ❤️ and Rust** — Zero GC pauses, zero compromises.
