# Use the Nginx image from Docker Hub
FROM nginx:1.29.0-alpine@sha256:f741b7f2e82ec8e3daa163b089d48ec163ad0b015d859a1e4f0f2a6202e8cc22

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
