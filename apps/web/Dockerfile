# =============================================================================
# GenFlow v2 — Remix Frontend Dockerfile
#
# Builder: node:20-alpine, pnpm install (no frozen-lockfile — lockfile
#   is generated during build since it's not checked into the monorepo)
# Runtime: node:20-alpine, production-only artifacts
# =============================================================================

FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Dependency cache layer
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
COPY packages/db/package.json packages/db/

RUN pnpm install

# Source code + build
COPY . .
RUN pnpm --filter @genflow/web build

# -------------------------------------------------------
# Runtime stage
# -------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production NODE_TELEMETRY_DISABLED=1 PORT=3000

COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./

EXPOSE 3000

CMD ["node_modules/.bin/remix-serve", "./build/server/index.js"]
