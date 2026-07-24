# Contributing to GenFlow v2

Thank you for contributing! This guide covers development setup, coding standards, and PR process.

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Rust | 1.75+ | `rustup update stable` |
| PostgreSQL | 16 | `docker-compose up -d db` or local install |
| Redis | 7 | `docker-compose up -d redis` or local install |
| sqlx-cli | latest | `cargo install sqlx-cli --no-default-features --features postgres` |

### Clone & Run

```bash
git clone https://github.com/hadiranweb/GenFlow.git
cd GenFlow
git checkout v2-island-architecture

# Start infrastructure
docker-compose up -d db redis

# Run migrations
sqlx migrate run --source migrations

# Build & check
cargo check --workspace

# Run tests
cargo test --workspace --lib

# Run gateway
cargo run -p genflow-gateway
```

---

## 📐 Coding Standards

### Architecture Rules

1. **Receptors are pure**: `genflow-receptors` has **zero** async/database/web dependencies. Only `serde`, `uuid`, `chrono`, `sha2`, `rand`.
2. **Shared Infra is pure domain**: `genflow-shared-infra` has **no axum** dependency. `AppError` is a domain error type. Gateway provides the `IntoResponse` bridge separately in `error_response.rs`.
3. **Islands depend on Receptors + Shared Infra**: Islands can depend on `genflow-synaptic-hub` and `genflow-mcp-registry` but not on each other (except `candidate-matching` → `position-generation`).
4. **Gateway is the composition root**: All `Arc<>` wiring happens in `gateway/src/main.rs`. Services are never constructed inside handlers.

### Rust Conventions

- **Error types**: Use `AppError` for infrastructure/business errors. Convert domain errors via `From` impls.
- **Redis operations**: Always use `query_async::<_, T>(&mut conn)` with explicit type annotation to avoid never-type-fallback errors.
- **sqlx Row access**: Always `use sqlx::Row;` before calling `row.get("column")`.
- **Axum paths**: Use `{id}` syntax (v0.7), not `:id` (v0.6).
- **State**: Use `Arc<AppState>` wrapped in State extractor.
- **Serialize/Deserialize**: All types that appear in API responses must have both `Serialize` and `Deserialize`.
- **Async traits**: Use `#[async_trait]` for runtime traits (McpRepository, McpCache, McpBuilder).

### Naming Conventions

- **Domain types (Farsi comments)**: Preserve Farsi documentation comments — they're intentional.
- **Database string mapping**: Every enum that maps to a DB column has `as_db_str()` and optionally `from_db_str()`.
- **Field names**: Never rename fields or change types without explicit approval — preserve original intent.

---

## 🧪 Testing

### Unit Tests (No DB Required)

```bash
cargo test --workspace --lib
```

These run without PostgreSQL or Redis. Currently 16 tests in `genflow-receptors`.

### Integration Tests (Requires DB + Redis)

```bash
# Start services
docker-compose up -d db redis

# Run all tests
cargo test --workspace
```

### Writing Tests

- **Domain logic tests** go in `genflow-receptors` (pure, no infrastructure).
- **Runtime tests** go in the island crate that owns the runtime trait.
- Use `mockall` for mocking async traits in tests.

---

## 📋 PR Process

1. **Branch from `v2-island-architecture`**: `git checkout -b feature/your-feature`
2. **Small, focused PRs**: One concern per PR. Don't mix refactor + feature + docs.
3. **CI must pass**: `cargo check --workspace` and `cargo test --workspace --lib` must both succeed.
4. **No structural changes without discussion**: Field names, table names, type choices — discuss first, implement second.
5. **Preserve intent**: Never rewrite what the original author intended. Add missing pieces, don't replace them.
6. **Farsi comments preserved**: Don't translate domain comments. They're part of the project's bilingual documentation.

### PR Checklist

- [ ] `cargo check --workspace` passes
- [ ] `cargo test --workspace --lib` passes
- [ ] No new unused imports or dead code warnings (or justified with `_` prefix)
- [ ] All API response types have `Serialize/Deserialize`
- [ ] Redis operations use explicit `query_async` type annotations
- [ ] `sqlx::Row` imported where needed
- [ ] No axum dependency in shared-infra or receptors

---

## 🔧 Common Fix Patterns

### Redis `query_async` Type Annotation

```rust
// ❌ Never-type fallback error
redis::cmd("PUBLISH")
    .arg(&channel)
    .arg(&payload)
    .query_async(&mut conn)
    .await?;

// ✅ Explicit return type
redis::cmd("PUBLISH")
    .arg(&channel)
    .arg(&payload)
    .query_async::<_, ()>(&mut conn)
    .await?;
```

### sqlx Row Access

```rust
// ❌ method not found on PgRow
let id: Uuid = row.get("id");

// ✅ Import Row trait
use sqlx::Row;
let id: Uuid = row.get("id");
```

### AppError in Axum Handlers

```rust
// ❌ Can't impl IntoResponse for AppError (orphan rule)
impl IntoResponse for AppError { ... }

// ✅ Use ApiError newtype wrapper (defined in gateway)
use crate::error_response::ApiError;
pub async fn handler() -> Result<Json<T>, ApiError> {
    let result = service.call().await?;  // ? converts AppError → ApiError via From
    Ok(Json(result))
}
```

---

## 📝 Git Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production releases |
| `v2-island-architecture` | v2 development (current) |
| `feature/*` | Feature branches |
| `hotfix/*` | Urgent production fixes |

---

**Questions? Open an issue or discussion on the [GenFlow repository](https://github.com/hadiranweb/GenFlow).**
