# Use the Nginx image from Docker Hub
FROM nginx:1.26.2-alpine@sha256:d6f8c6b38edf2b7c6619718ad7a00caa4ed4741d12ce12550333a28d2b52dc89

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
