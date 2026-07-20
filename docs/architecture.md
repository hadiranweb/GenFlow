# GenFlow Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User                                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Frontend                           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Rust API (Axum)                           │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │  Analysis    │  │  Position    │  │  Report      │   │
│   │  Service     │  │  Service     │  │  Service     │   │
│   └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                         │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     Redis      │  │    Qdrant       │
│   (Data)        │  │   (Cache)      │  │   (Vectors)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, Tailwind |
| **Backend** | Rust + Axum |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Vector DB** | Qdrant |
| **AI** | OpenAI / Anthropic Claude |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/analyze/personality` | Personality analysis |
| POST | `/api/v1/analyze/business` | Business analysis |
| POST | `/api/v1/generate/position` | Position generation |
| GET | `/api/v1/positions/{id}` | Get position |

## Data Flow

```
1. User fills form
        │
        ▼
2. Frontend → API (POST /analyze/personality)
        │
        ▼
3. API → AI (OpenAI/Claude)
        │
        ▼
4. Save to PostgreSQL + Cache in Redis
        │
        ▼
5. Frontend displays result
```
