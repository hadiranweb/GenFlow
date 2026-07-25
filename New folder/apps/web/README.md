# GenFlow Web

Next.js frontend application.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React + Tailwind CSS
- **State:** Zustand
- **HTTP:** Native fetch

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Application runs on `http://localhost:3000`.

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
│
├── src/
│   └── lib/
│       └── api.ts        # API client
│
├── components/            # Shared components
└── public/               # Static assets
```

## Design System

Uses GenFlow Design System with:
- Navy, Teal, Gold color palette
- 8px spacing grid
- RTL support for Persian

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Docker

```bash
docker build -t genflow-web -f Dockerfile .
docker run -p 3000:3000 genflow-web
```
