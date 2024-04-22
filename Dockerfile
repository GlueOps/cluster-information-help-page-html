# Use the Nginx image from Docker Hub
FROM nginx:1.25.5-alpine@sha256:7bd88800d8c18d4f73feeee25e04fcdbeecfc5e0a2b7254a90f4816bb67beadd

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
