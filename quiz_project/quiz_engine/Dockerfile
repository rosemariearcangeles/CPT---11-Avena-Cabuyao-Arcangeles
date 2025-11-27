# Use PHP with Apache
FROM php:8.2-apache

# Enable needed extensions
RUN docker-php-ext-install mysqli

# Copy project files to Apache directory
COPY . /var/www/html/

# Expose port
EXPOSE 80
