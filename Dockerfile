# Use the Nginx image from Docker Hub
FROM nginx:1.26.1-alpine@sha256:208ae3c180b7d26f6a8046fac4c8468b2ab8bd92123ab73f9c5ad0f6f1c5543d

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
