# syntax=docker/dockerfile:1

# Build from the repository root: docker build -f programs/snapcall-server/Dockerfile .
FROM node:24.22.1-bookworm-slim AS base
# Keep in sync with packageManager in the root package.json.
RUN npm install --global pnpm@12.15.0 && npm cache clean --force
WORKDIR /app

FROM base AS pruner
COPY . .
# Keep in sync with the turbo version in the pnpm catalog.
RUN pnpm dlx turbo@2.11.10 prune @snapcall/snapcall-server --docker

FROM base AS installer
# Dependency manifests only, so this layer is reused until dependencies change.
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile --prod --filter "@snapcall/snapcall-server..."
COPY --from=pruner /app/out/full/ ./

FROM node:24.22.1-bookworm-slim
LABEL org.opencontainers.image.title="snapcall-server"
LABEL org.opencontainers.image.source="https://github.com/adamaho/snapcall"
ENV NODE_ENV=production \
    SNAPCALL_SERVER_HOST=0.0.0.0 \
    SNAPCALL_SERVER_PORT=13000
COPY --from=installer /app /app
WORKDIR /app/programs/snapcall-server
USER node
EXPOSE 13000
# Migrations must finish successfully before the server starts.
CMD ["sh", "-c", "node src/database/migrate.ts && exec node src/main.ts"]
