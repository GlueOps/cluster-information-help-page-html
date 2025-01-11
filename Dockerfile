# Use the Nginx image from Docker Hub
FROM nginx:1.26.2-alpine@sha256:b9e1705b69f778dca93cbbbe97d2c2562fb26cac1079cdea4e40d1dad98f14fe

# Copy the HTML file to the Nginx document root
COPY index.html /usr/share/nginx/html
