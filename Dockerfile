# GenFlow v2 — Multi-stage Dockerfile (workspace-aware, proper cache layers)
#
# Key fixes from v1:
# 1. Workspace-aware build (Cargo.toml at root)
# 2. Proper dependency caching with workspace
# 3. sqlx-dataless build (no offline mode issues)
# 4. Non-root user, health check

# ============================================================
# Build Stage
# ============================================================
FROM rust:1.78-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests first (dependency caching layer)
COPY Cargo.toml Cargo.lock ./

# Create dummy source files for each workspace member to cache dependencies
RUN mkdir -p receptors/genflow-receptors/src && echo "pub fn dummy() {}" > receptors/genflow-receptors/src/lib.rs
RUN mkdir -p shared-infra/src && echo "pub fn dummy() {}" > shared-infra/src/lib.rs
RUN mkdir -p synaptic-hub/src && echo "pub fn dummy() {}" > synaptic-hub/src/lib.rs
RUN mkdir -p islands/mcp-registry/src && echo "pub fn dummy() {}" > islands/mcp-registry/src/lib.rs
RUN mkdir -p islands/mcp-registry/src/runtime && echo "" > islands/mcp-registry/src/runtime/mod.rs
RUN mkdir -p islands/mcp-registry/src/traits && echo "" > islands/mcp-registry/src/traits/mod.rs
RUN mkdir -p islands/position-generation/src && echo "pub fn dummy() {}" > islands/position-generation/src/lib.rs
RUN mkdir -p islands/position-generation/src/services && echo "" > islands/position-generation/src/services/mod.rs
RUN mkdir -p islands/candidate-matching/src && echo "pub fn dummy() {}" > islands/candidate-matching/src/lib.rs
RUN mkdir -p islands/candidate-matching/src/services && echo "" > islands/candidate-matching/src/services/mod.rs
RUN mkdir -p islands/dashboard-analytics/src && echo "pub fn dummy() {}" > islands/dashboard-analytics/src/lib.rs
RUN mkdir -p islands/dashboard-analytics/src/services && echo "" > islands/dashboard-analytics/src/services/mod.rs
RUN mkdir -p gateway/src && echo "fn main() {}" > gateway/src/main.rs
RUN mkdir -p gateway/src/state && echo "" > gateway/src/state/mod.rs
RUN mkdir -p gateway/src/api && echo "" > gateway/src/api/mod.rs
RUN mkdir -p gateway/src/api/handlers && echo "" > gateway/src/api/handlers/mod.rs

# Create Cargo.toml files for each crate (workspace members)
COPY receptors/genflow-receptors/Cargo.toml receptors/genflow-receptors/
COPY shared-infra/Cargo.toml shared-infra/
COPY synaptic-hub/Cargo.toml synaptic-hub/
COPY islands/mcp-registry/Cargo.toml islands/mcp-registry/
COPY islands/position-generation/Cargo.toml islands/position-generation/
COPY islands/candidate-matching/Cargo.toml islands/candidate-matching/
COPY islands/dashboard-analytics/Cargo.toml islands/dashboard-analytics/
COPY gateway/Cargo.toml gateway/

# Build dependencies (cache layer)
RUN cargo build --release 2>/dev/null || true

# Now copy real source code
COPY receptors/ receptors/
COPY shared-infra/ shared-infra/
COPY synaptic-hub/ synaptic-hub/
COPY islands/ islands/
COPY gateway/ gateway/
COPY migrations/ migrations/

# Touch all source files to invalidate the dummy cache
RUN find receptors shared-infra synaptic-hub islands gateway -name "*.rs" -exec touch {} +

# Build the gateway binary (the only binary in the workspace)
RUN cargo build --release -p genflow-gateway

# ============================================================
# Runtime Stage
# ============================================================
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/target/release/genflow-api /app/genflow-api
COPY --from=builder /app/migrations /app/migrations

# Non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["./genflow-api"]
