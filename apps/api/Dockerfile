# ===========================================
# GenFlow API - Rust Dockerfile
# Build context must be the repository root:
# docker build -f apps/api/Dockerfile .
# ===========================================

# Stage 1: Build
FROM rust:1-bookworm AS builder

WORKDIR /app/apps/api

# Install native build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifest first for better Docker layer caching
COPY apps/api/Cargo.toml apps/api/Cargo.lock* ./

# Build dependencies only
RUN mkdir -p src \
    && echo "fn main() {}" > src/main.rs \
    && echo "" > src/lib.rs \
    && cargo build --release \
    && rm -rf src

# Copy actual source
COPY apps/api/src ./src
COPY apps/api/migrations ./migrations

# Build the application
RUN cargo build --release

# ===========================================
# Stage 2: Runtime
# ===========================================
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/apps/api/target/release/genflow-api /app/genflow-api

# Copy migrations
COPY --from=builder /app/apps/api/migrations /app/migrations

# Set environment
ENV RUST_LOG=info
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run
CMD ["./genflow-api"]
