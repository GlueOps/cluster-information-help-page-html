# Stage 1: Build
FROM node:lts-alpine@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS builder
WORKDIR /app

# Use a cache mount for npm to speed up subsequent builds
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine@sha256:1d13701a5f9f3fb01aaa88cef2344d65b6b5bf6b7d9fa4cf0dca557a8d7702ba

# Set up permissions for non-root execution
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html

USER nginx

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]