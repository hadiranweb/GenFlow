# GenFlow v2 — Remix Web Dockerfile (Simple & Production)
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @genflow/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NODE_TELEMETRY_DISABLED=1 PORT=3000

COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./

EXPOSE 3000
CMD ["node_modules/.bin/remix-serve", "./build/server/index.js"]
