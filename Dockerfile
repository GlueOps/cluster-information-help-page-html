# Use the Nginx image from Docker Hub

FROM nginx:1.29.0-alpine@sha256:d67ea0d64d518b1bb04acde3b00f722ac3e9764b3209a9b0a98924ba35e4b779

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
