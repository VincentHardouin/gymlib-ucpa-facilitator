ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine as builder
WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

FROM node:${NODE_VERSION}-alpine

WORKDIR /app
USER node

COPY --from=builder /app  .

ARG PORT=4000
ENV PORT $PORT
EXPOSE $PORT