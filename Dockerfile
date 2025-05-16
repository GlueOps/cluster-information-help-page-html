# Use the Nginx image from Docker Hub
FROM nginx:1.28.0-alpine@sha256:aed99734248e851764f1f2146835ecad42b5f994081fa6631cc5d79240891ec9

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
