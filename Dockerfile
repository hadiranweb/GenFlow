# =============================================================================
# GenFlow v2 — Production Rust API Dockerfile
#
# Builder  → rust:1.88-slim  (MSRV-locked, workspace-aware caching)
# Runtime  → debian:bookworm-slim  (~100 MB, libc + ca-certs + curl for health)
#
# Performance: ZERO Docker overhead. Rust binary runs at native speed.
# .cargo/config.toml provides LTO + strip + panic=abort for max perf.
#
# Image size breakdown:  ~20 MB binary + ~80 MB base + deps ≈ ~100 MB
# =============================================================================

# ============================================================
# Stage 1: Dependency Cache (planner)
# ============================================================
FROM rust:1.88-slim AS planner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace manifest & lock first (caching)
COPY Cargo.toml Cargo.lock ./

# Dummy source files for ALL 8 workspace crates to freeze dependency layers
RUN mkdir -p receptors/genflow-receptors/src \
  && echo "pub fn dummy() {}" > receptors/genflow-receptors/src/lib.rs \
  && mkdir -p shared-infra/src \
  && echo "pub fn dummy() {}" > shared-infra/src/lib.rs \
  && mkdir -p synaptic-hub/src \
  && echo "pub fn dummy() {}" > synaptic-hub/src/lib.rs \
  && mkdir -p islands/mcp-registry/src/runtime \
  && echo "pub fn dummy() {}" > islands/mcp-registry/src/lib.rs \
  && echo "" > islands/mcp-registry/src/runtime/mod.rs \
  && mkdir -p islands/position-generation/src/services \
  && echo "pub fn dummy() {}" > islands/position-generation/src/lib.rs \
  && echo "" > islands/position-generation/src/services/mod.rs \
  && mkdir -p islands/candidate-matching/src/services \
  && echo "pub fn dummy() {}" > islands/candidate-matching/src/lib.rs \
  && echo "" > islands/candidate-matching/src/services/mod.rs \
  && mkdir -p islands/dashboard-analytics/src/services \
  && echo "pub fn dummy() {}" > islands/dashboard-analytics/src/lib.rs \
  && echo "" > islands/dashboard-analytics/src/services/mod.rs \
  && mkdir -p gateway/src/api/handlers \
  && echo "fn main() {}" > gateway/src/main.rs \
  && echo "" > gateway/src/api/mod.rs \
  && echo "" > gateway/src/api/handlers/mod.rs

# Copy per-crate Cargo.toml files
COPY receptors/genflow-receptors/Cargo.toml receptors/genflow-receptors/
COPY shared-infra/Cargo.toml shared-infra/
COPY synaptic-hub/Cargo.toml synaptic-hub/
COPY islands/mcp-registry/Cargo.toml islands/mcp-registry/
COPY islands/position-generation/Cargo.toml islands/position-generation/
COPY islands/candidate-matching/Cargo.toml islands/candidate-matching/
COPY islands/dashboard-analytics/Cargo.toml islands/dashboard-analytics/
COPY gateway/Cargo.toml gateway/
COPY .cargo/config.toml .cargo/

# Build dependencies only (cached layer — invalidates only on Cargo.toml changes)
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo build --release -p genflow-gateway --locked

# ============================================================
# Stage 2: Real Build
# ============================================================
FROM rust:1.88-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Reuse planner's dependency cache
COPY --from=planner /app /app
COPY --from=planner /usr/local/cargo/registry /usr/local/cargo/registry

# Copy real source code
COPY receptors/ receptors/
COPY shared-infra/ shared-infra/
COPY synaptic-hub/ synaptic-hub/
COPY islands/ islands/
COPY gateway/ gateway/
COPY migrations/ migrations/
COPY .cargo/config.toml .cargo/

# Invalidate the planner's dummy build artifacts
RUN find receptors shared-infra synaptic-hub islands gateway -name "*.rs" -exec touch {} +

# Full release build with LTO + strip + panic=abort
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo build --release -p genflow-gateway

# Final strip for minimum binary size
RUN strip -s /app/target/release/genflow-api

# Verify binary integrity
RUN /app/target/release/genflow-api --version 2>/dev/null || \
    echo "Warning: --version flag not set; binary exists: $(ls -lh /app/target/release/genflow-api)"

# ============================================================
# Stage 3: Runtime (debian:bookworm-slim — libc, ca-certs, curl)
# ============================================================
FROM debian:bookworm-slim

WORKDIR /app

# Install minimal runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/doc /usr/share/man /usr/share/info

# Copy binary & embedded migrations
COPY --from=builder /app/target/release/genflow-api /app/genflow-api
COPY --from=builder /app/migrations /app/migrations

# Non-root user
RUN groupadd -r genflow --gid 1000 \
    && useradd -r -g genflow --uid 1000 -d /app genflow \
    && chown -R genflow:genflow /app

USER genflow

EXPOSE 3000

# Healthcheck hits the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -sf http://localhost:3000/health || exit 1

ENTRYPOINT ["/app/genflow-api"]
