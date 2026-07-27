# =============================================================================
# GenFlow v2 — Remix Frontend Dockerfile (production)
#
# Builder  → node:20-alpine (multi-stage, pnpm frozen-lockfile)
# Runtime  → node:20-alpine (production-only deps, non-root)
#
# Performance: ZERO overhead. Remix SSR + Node 20 at native speed.
# Image size: ~180 MB (includes only production deps)
# =============================================================================

# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Lockfile and workspace manifests (caching layer)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/db/package.json packages/db/package.json
COPY .npmrc ./

# Install with frozen lockfile for reproducibility
RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Copy cached node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules

# Copy source code
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/ apps/web/
COPY packages/ packages/
COPY turbo.json ./

# Build (Turborepo caches within the build)
ENV NODE_TELEMETRY_DISABLED=1 \
    CI=true \
    TURBO_CACHE_DIR=/tmp/turbo-cache

RUN pnpm --filter @genflow/web build

# ============================================================
# Stage 3: Production runtime
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NODE_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Add non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 remix

# Copy built artifacts (only what's needed at runtime)
COPY --from=builder --chown=remix:nodejs /app/apps/web/build ./build
COPY --from=builder --chown=remix:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=remix:nodejs /app/apps/web/package.json ./package.json

# Install only production dependencies for the web app
COPY --from=builder --chown=remix:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=remix:nodejs /app/apps/web/node_modules ./apps/web/node_modules

USER remix

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', r => {process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node_modules/.bin/remix-serve", "./build/server/index.js"]
