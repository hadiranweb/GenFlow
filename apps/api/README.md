# GenFlow API

REST API service for job position generation.

## Tech Stack

- **Framework:** Axum (Rust)
- **Database:** PostgreSQL with SQLx
- **Cache:** Redis
- **Vector DB:** Qdrant (optional)

## Quick Start

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Run
cargo run
```

Server runs on `http://localhost:8080`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/analyze/personality` | Personality analysis |
| POST | `/api/v1/analyze/business` | Business analysis |
| POST | `/api/v1/generate/position` | Generate position |
| GET | `/api/v1/positions/{id}` | Get position by ID |

## Development

```bash
# Build
cargo build

# Run tests
cargo test

# Run with hot reload
cargo watch -x run
```

## Docker

```bash
docker build -t genflow-api -f Dockerfile .
docker run -p 8080:8080 genflow-api
```
