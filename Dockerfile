# Use the Nginx image from Docker Hub
FROM nginx:1.27.4-alpine@sha256:b471bb609adc83f73c2d95148cf1bd683408739a3c09c0afc666ea2af0037aef

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
