# Contributing to GenFlow

Thank you for your interest in contributing to GenFlow!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Rust 1.76+ (for API development)
- Docker (optional)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

## Project Structure

```
genflow/
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # Rust API
├── packages/
│   ├── ui/         # Shared UI components
│   └── db/         # Database client
└── infrastructure/ # Docker compose
```

## Making Changes

1. Make your changes
2. Run tests: `pnpm test`
3. Run lint: `pnpm lint`
4. Commit with a clear message

## Commit Message Format

```
type(scope): description

types: feat, fix, docs, style, refactor, test, chore
```

## Pull Request Process

1. Update documentation if needed
2. Ensure CI passes
3. Request review from maintainers

## Code Style

- TypeScript: Follow ESLint configuration
- Rust: Follow rustfmt configuration
- CSS: Follow Tailwind best practices

## Questions?

Open an issue for discussion before making large changes.
