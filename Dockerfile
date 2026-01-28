FROM node:lts-alpine@sha256:93d1011bb2c616733850ebb39a24c665306505425e46ca99ca1990954f278539 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine@sha256:7d7a15b8a280c661051955f14c2b91fed3e23724ddba18d2f53e8b44e74ab37a
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["sh", "/docker-entrypoint.sh"]