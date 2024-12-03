# Use the Nginx image from Docker Hub
FROM nginx:1.26.2-alpine@sha256:35e3238f2f0925a505d5d697df9a9148db9a0c78e89fd2e253919047b3cec824

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
