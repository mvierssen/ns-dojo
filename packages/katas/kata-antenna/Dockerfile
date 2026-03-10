# Base stage
FROM node:22-slim AS base
WORKDIR /app
ENV MOON_TOOLCHAIN_FORCE_GLOBALS=true
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g @moonrepo/cli

# Skeleton stage
FROM base AS skeleton
COPY . .
RUN moon docker scaffold kata-antenna

# Build stage
FROM base AS build
COPY --from=skeleton /app/.moon/docker/configs .
RUN --mount=type=cache,target=/root/.npm moon docker setup
COPY --from=skeleton /app/.moon/docker/sources .
RUN moon run kata-antenna:build
RUN moon docker prune

# Runtime stage
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime
WORKDIR /app
COPY --from=build --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /app/packages ./packages
WORKDIR /app/packages/katas/kata-antenna
ENV NODE_ENV=production
CMD ["dist/main.js"]
