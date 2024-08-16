# Use the Nginx image from Docker Hub
FROM nginx:1.26.2-alpine@sha256:d4d72ee8e6d028c5ad939454164d3645be2d38afb5c352277926a48e24abf4fa

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
