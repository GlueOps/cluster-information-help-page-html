# Use the Nginx image from Docker Hub

FROM nginx:1.27.3-alpine@sha256:814a8e88df978ade80e584cc5b333144b9372a8e3c98872d07137dbf3b44d0e4


# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
