# Use the Nginx image from Docker Hub
FROM nginx:1.27.3-alpine@sha256:41523187cf7d7a2f2677a80609d9caa14388bf5c1fbca9c410ba3de602aaaab4

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
