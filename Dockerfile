# Use the Nginx image from Docker Hub
FROM nginx:1.26.2-alpine@sha256:5b44a5ab8ab467854f2bf7b835a32f850f32eb414b749fbf7ed506b139cd8d6b

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
