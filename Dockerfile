FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
    libzip-dev \
    git \
    curl \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install -j$(nproc) pdo zip bcmath

RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer update --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions \
    storage/framework/views \
    && chmod -R 755 storage bootstrap/cache

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
