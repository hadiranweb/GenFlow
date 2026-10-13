# ---------- مرحلهٔ ساخت ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY data ./data

RUN npm run build

# ---------- مرحلهٔ اجرا ----------
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HTTP_PORT=8080 \
    DATA_DIR=/app/data \
    DATABASE_PATH=/app/data/app.db \
    REPORTS_DIR=/app/data/reports

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY data ./data

# پوشهٔ داده با دسترسی کاربر غیرروت (اصل حداقل دسترسی)
RUN mkdir -p /app/data/reports && chown -R node:node /app
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.HTTP_PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--no-warnings=ExperimentalWarning", "dist/index.js"]
