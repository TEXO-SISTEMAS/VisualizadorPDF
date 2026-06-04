#!/bin/bash
set -e

echo "=== Limpiando caché ==="
php artisan config:clear
php artisan cache:clear

echo "=== Ejecutando migraciones ==="
php artisan migrate --force

echo "=== Iniciando Apache ==="
apache2-foreground
