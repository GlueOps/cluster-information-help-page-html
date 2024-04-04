# Use the Nginx image from Docker Hub
FROM nginx:1.25.4-alpine@sha256:31bad00311cb5eeb8a6648beadcf67277a175da89989f14727420a80e2e76742

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
