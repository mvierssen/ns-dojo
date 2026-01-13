# Base stage
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g @moonrepo/cli

# Skeleton stage
FROM base AS skeleton
COPY . .
RUN moon docker scaffold kata-connect-4

# Build stage
FROM base AS build
COPY --from=skeleton /app/.moon/docker/workspace .
RUN npm ci
COPY --from=skeleton /app/.moon/docker/sources .
RUN moon run kata-connect-4:build
RUN moon docker prune

# Runtime stage
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime
WORKDIR /app
COPY --from=build --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /app/packages ./packages
WORKDIR /app/packages/katas/kata-connect-4
ENV NODE_ENV=production
# Run with: docker run -it connect4
CMD ["dist/main.js"]
