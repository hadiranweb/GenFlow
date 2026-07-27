# =============================================================================
# GenFlow v2 — Rust API Dockerfile (Simple & Production)
#
# Simple, robust, no complex caching. Builds and runs at native speed.
# =============================================================================

FROM rust:1.88-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY . .
RUN cargo build --release -p genflow-gateway --locked

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/genflow-api /app/genflow-api
COPY --from=builder /app/migrations /app/migrations

EXPOSE 3000
HEALTHCHECK CMD curl -sf http://localhost:3000/health || exit 1
ENTRYPOINT ["/app/genflow-api"]
