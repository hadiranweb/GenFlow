# ===========================================
# GenFlow API - Rust Dockerfile
# ===========================================

# Stage 1: Build
FROM rust:1.76-bookworm as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml Cargo.lock* ./
COPY src ./src

# Create dummy main.rs for dependency caching
RUN mkdir -p src && echo "fn main() {}" > src/main.rs

# Build dependencies only
RUN cargo build --release && rm -rf src

# Copy actual source
COPY src ./src

# Build the application
RUN touch src/main.rs && cargo build --release

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
COPY --from=builder /app/target/release/genflow-api /app/genflow-api

# Copy migrations (if any)
COPY migrations/ /app/migrations/

# Set environment
ENV RUST_LOG=info
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run
CMD ["./genflow-api"]
