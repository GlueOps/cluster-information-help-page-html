# Use the Nginx image from Docker Hub
FROM nginx:1.27.0-alpine@sha256:208b70eefac13ee9be00e486f79c695b15cef861c680527171a27d253d834be9

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
