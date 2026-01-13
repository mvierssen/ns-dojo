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
