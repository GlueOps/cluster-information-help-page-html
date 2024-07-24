# Use the Nginx image from Docker Hub
FROM nginx:1.26.1-alpine@sha256:33001975a6ea5a2b78d108b64bdc89b434e31f523d3bc641ca2a3136d9024df8

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
