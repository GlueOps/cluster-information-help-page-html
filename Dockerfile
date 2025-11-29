FROM node:lts-alpine@sha256:2867d550cf9d8bb50059a0fff528741f11a84d985c732e60e19e8e75c7239c43 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine@sha256:4e6b072d50b6c2b8caae37acc324ae58290bfaf3320ba2c4a4d4caa09bcd2916
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["sh", "/docker-entrypoint.sh"]