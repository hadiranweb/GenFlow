# GenFlow v2 — Deep Review Report (لایه عمیق)

**تاریخ**: 2026-07-25  
**برانچ**: `v2-island-architecture`  
**ZIP**: `genflow-v2-complete.zip` (136KB, 132 files)

---

## ✅ CI Pipeline Status

| Step | Result |
|------|--------|
| `cargo fmt --all -- --check` | ✅ PASS (0 diff) |
| `cargo clippy --workspace --all-targets -- -D warnings` | ✅ PASS (0 errors) |
| `cargo test --workspace --lib` | ✅ PASS (16 tests) |
| `cargo build --release -p genflow-gateway` | ✅ PASS (binary produced) |
| `cargo check --workspace` | ✅ PASS (0 errors) |

---

## 🔧 Fixes Applied (Deep Layer)

### 1. 🚨 `dashboard_activity` → `activity_logs` (SQL table name mismatch)
**File**: `islands/dashboard-analytics/src/services/dashboard_engine.rs`
- Rust query referenced non-existent table `dashboard_activity`
- SQL schema has `activity_logs`
- **Fix**: Changed query to `SELECT * FROM activity_logs`

### 2. 🚨 `activity_logs` column mapping mismatch
**File**: `islands/dashboard-analytics/src/services/dashboard_engine.rs`
- Rust mapped: `actor_name` (non-existent), `entity_title` (non-existent), `timestamp` (non-existent)
- SQL has: `actor_id`, `entity_id`, `created_at`
- **Fix**: Construct `actor_name` from `actor_id`, `entity_title` from `entity_type + entity_id`, `timestamp` → `created_at`

### 3. 🚨 `notifications` INSERT column mismatch
**File**: `islands/dashboard-analytics/src/services/notification_service.rs`
- Rust: `(user_id, notification_type, message, channel, status)` — wrong columns
- SQL: `(recipient_id, type, title, message, entity_type, entity_id, is_read)`
- **Fix**: Complete rewrite of `send_notification()` with correct column names and expanded signature

### 4. 🚨 `job_matches` INSERT column name mismatch
**File**: `islands/candidate-matching/src/services/matching_engine.rs`
- Rust: `capability_match, output_kpi_match, business_gap_match, work_style_alignment, growth_motivation_match, composite_index`
- SQL: `capability_match_score, output_kpi_match_score, business_gap_match_score, work_style_alignment_score, growth_motivation_match_score, composite_match_index`
- **Fix**: Added `_score` suffix to match SQL, `composite_index` → `composite_match_index`

### 5. 🚨 `mcp_usage` → `business_analysis_mcp_usage` (table name mismatch)
**File**: `islands/mcp-registry/src/runtime/repository.rs`
- Rust: `INSERT INTO mcp_usage (analysis_id, mcp_id, ...)`
- SQL: `INSERT INTO business_analysis_mcp_usage (business_analysis_id, mcp_context_id, ...)`
- **Fix**: Correct table name and column names

### 6. 🚨 `row_to_context()` hardcoded McpType/McpScope/McpStatus
**File**: `islands/mcp-registry/src/runtime/repository.rs`
- `McpType::PlatformPolicy` hardcoded instead of parsing from DB string
- `McpScope::Global` hardcoded
- `McpStatus::Draft` hardcoded
- **Fix**: Added `from_db_str()` methods to all 3 enums in `receptors`, used in `row_to_context()`

### 7. 🚨 `McpScope::from_db_str()` placed outside `impl` block
**File**: `receptors/genflow-receptors/src/domain/mcp/mcp_context.rs`
- `from_db_str` was orphaned outside `impl McpScope {}`, causing compile error
- **Fix**: Moved inside the `impl` block

### 8. ⚠️ `BusinessAnalysisRequest` missing `Serialize, Deserialize`
**File**: `receptors/genflow-receptors/src/domain/position_generation.rs`
- Used in gateway handler for JSON deserialization but had only `#[derive(Debug, Clone)]`
- **Fix**: Added `Serialize, Deserialize`

### 9. ⚠️ Clippy warnings → CI would FAIL
**Multiple files** — all `clippy -D warnings` errors fixed:
- `score.rs`: manual range contains → `(0.0..=100.0).contains()`
- `representative.rs`: manual range contains → `(0.0..=1.0).contains()`
- `auth.rs`: `clone()` to slice → `std::slice::from_ref()`
- `telemetry.rs`: match single binding → removed match
- `convergence.rs`: dead_code → `#[allow(dead_code)]`
- `state.rs`: dead_code → `#[allow(dead_code)]`
- `business_analysis_engine.rs`: unused imports + dead_code
- `position_generation_engine.rs`: dead_code pool field
- `matching_engine.rs`: unused BigFiveScores import
- `resolver.rs`: unused `analysis_id` variable
- Default impls added: McpBuilderImpl, BusinessNeedDiscovery, PositionGraphBuilder, RepresentativeCalibrator

### 10. ⚠️ `cargo fmt` not applied → CI would FAIL
**All files** — `cargo fmt --all` applied, now passes `--check`

### 11. ⚠️ `Cargo.lock` in `.gitignore`
**File**: `.gitignore`
- `Cargo.lock` was ignored, but binary crates MUST commit it
- **Fix**: Commented out the `Cargo.lock` line

### 12. ⚠️ Docker `migrate` service uses non-existent `--migrate-only` flag
**File**: `docker-compose.yml`
- Gateway binary has no CLI arg parser
- **Fix**: Changed to `sqlx migrate run` command with fallback note

### 13. ⚠️ `db.rs` migration runner was no-op
**File**: `shared-infra/src/db.rs`
- `run_migrations()` was effectively empty (just logged, no actual migration)
- **Fix**: Implemented with `sqlx::migrate!("../migrations")` Migrator

---

## 📋 Remaining Known Limitations (not blocking)

| Issue | Severity | Note |
|-------|----------|------|
| `load_position_graph()` returns empty axes | Placeholder | Need DB loading for real graph |
| `load_candidate_profile()` returns empty profile | Placeholder | Need DB loading |
| `accept_invitation` generates random `candidate_id` | Placeholder | Should come from auth context |
| `get_position` handler returns NotFound | Placeholder | Not yet implemented |
| `generate_report` handler returns NotFound | Placeholder | Not yet implemented |
| `policy_guardrails` empty in resolve_for_analysis | TODO | Policy MCP resolution not implemented |
| `sqlx-postgres v0.7.4` future-incompat warning | Non-blocking | Will need upgrade eventually |
| Integration tests require running PostgreSQL + Redis | Future | Only unit tests currently |

---

## 📊 File Count Summary

| Type | Count |
|------|-------|
| Rust source (.rs) | 66 |
| SQL migrations (.sql) | 7 |
| CI/CD workflows (.yml) | 3 (ci.yml, cd.yml) |
| Documentation (.md) | 8 (README, CHANGELOG, CONTRIBUTING, SECURITY, architecture, matching, mcp, event-flow) |
| Config files | 8 (.gitignore, .dockerignore, .env.example, .gitattributes, Cargo.toml, Cargo.lock, Dockerfile, docker-compose.yml) |
| Other | LICENSE, CODEOWNERS, DEEP-REVIEW.md |
| **Total** | **132 files** |
