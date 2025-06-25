# Use the Nginx image from Docker Hub
FROM nginx:1.29.0-alpine@sha256:b2e814d28359e77bd0aa5fed1939620075e4ffa0eb20423cc557b375bd5c14ad

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
