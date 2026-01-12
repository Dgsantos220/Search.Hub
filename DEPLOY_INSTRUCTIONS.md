# Instruções de Deploy na VPS

Siga estes passos para atualizar seu sistema em produção:

## 1. Atualize o .env na VPS
Adicione estas chaves no final do seu arquivo `.env`:

```ini
APP_NAME="Los Dados"
VITE_APP_NAME="Los Dados"

VAPID_PUBLIC_KEY=BMpq_2Yev1Dfmh1uRLAnMrE5IRXdrc3DEba9iED9tZK4_FN_fW5V6Ieb8t6mbibjKEW7npmtUtV9kVO74ocyJb8
VAPID_PRIVATE_KEY=VAJDdSFSAuAxQqFbhE7kEsGmPLFWKOv2zAXPPWYIjEA
VITE_VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY}"
```

## 2. Execute os Comandos
Na pasta do projeto na VPS:

```bash
# Baixar código
git pull origin main

# Dependências Backend
composer install --no-dev --optimize-autoloader

# Banco de Dados
php artisan migrate --force

# Caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend (Build)
npm install
npm run build
```
