# Use the Nginx image from Docker Hub
FROM nginx:1.25.2-bookworm-perl

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
