# Build from repository root: docker build -f apps/web/Dockerfile .
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY . .
ENV NODE_TELEMETRY_DISABLED=1
RUN pnpm --filter @genflow/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NODE_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 remix
COPY --from=builder --chown=remix:nodejs /app/apps/web/build ./build
COPY --from=builder --chown=remix:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=remix:nodejs /app/apps/web/package.json ./package.json
USER remix
EXPOSE 3000
CMD ["node", "node_modules/.bin/remix-serve", "./build/server/index.js"]
