# Use the Nginx image from Docker Hub
FROM nginx:1.28.0-alpine@sha256:94408aa6adc1b04bd7d0ebdb3ffcc09ee867cf7b94927cffc35634e5d2dce08b

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
