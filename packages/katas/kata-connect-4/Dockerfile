# Base stage
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g @moonrepo/cli

# Skeleton stage
FROM base AS skeleton
COPY . .
RUN moon docker scaffold kata-connect-4
