#!/bin/sh
set -e
cd /var/www/html

# Install Composer deps (idempotent; safe if vendor exists)
if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

# Generate app key if not set (writes to .env)
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
  php artisan key:generate --force
fi

# Run migrations (optional; remove or set RUN_MIGRATIONS=0 to skip)
if [ "$RUN_MIGRATIONS" != "0" ]; then
  php artisan migrate --force 2>/dev/null || true
fi

exec php artisan serve --host=0.0.0.0 --port=8000
