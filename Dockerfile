# Use the Nginx image from Docker Hub
FROM nginx:1.25.5-alpine@sha256:516475cc129da42866742567714ddc681e5eed7b9ee0b9e9c015e464b4221a00

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
