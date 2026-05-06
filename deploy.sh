#!/bin/bash
# ============================================================
#  Yuksalish Production Deploy Script
#  Server: DigitalOcean Frankfurt — 104.248.25.130
#  Usage: bash deploy.sh
# ============================================================
set -e

REPO_URL="https://github.com/Bekmuhammad-Devoloper/IT-jobs.git"
APP_DIR="/opt/it-jobs"
DOMAIN="it-jobs.bekmuhammad.uz"
EMAIL="admin@bekmuhammad.uz"

echo ""
echo "======================================"
echo "  Yuksalish — Production Deploy"
echo "======================================"
echo ""

# ── 1. System packages ──────────────────────────────────────
echo "[1/7] Installing system packages..."
apt-get update -y
apt-get install -y git curl nginx certbot python3-certbot-nginx

# ── 2. Docker ───────────────────────────────────────────────
echo "[2/7] Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installed."
else
  echo "Docker already installed."
fi

# Docker Compose plugin
if ! docker compose version &>/dev/null 2>&1; then
  apt-get install -y docker-compose-plugin
fi

# ── 3. Clone / update repo ──────────────────────────────────
echo "[3/7] Cloning / updating repo..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
  echo "Repo updated."
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  echo "Repo cloned."
fi

cd "$APP_DIR"

# ── 4. Create .env for docker-compose ───────────────────────
echo "[4/7] Creating .env..."
cat > .env <<'EOF'
# PostgreSQL
POSTGRES_DB=yuksalish
POSTGRES_USER=postgres
DB_PASSWORD=Yuksalish2026Secure

# Redis
REDIS_PASSWORD=YuksalishRedis2026

# JWT
JWT_SECRET=YuksalishJWTProductionSecret2026
JWT_EXPIRATION=7d

# Telegram
BOT_TOKEN=8342175601:AAHK5EX79frw8tKgqUBGkBqTGwRIY1u3OAg
CHANNEL_ID=
CHANNEL_USERNAME=@yuksalish_channel

# Public URLs
WEBAPP_URL=https://it-jobs.bekmuhammad.uz
ADMIN_URL=https://it-jobs.bekmuhammad.uz/admin

# Admin
SUPER_ADMIN_IDS=123456789
ADMIN_SECRET_KEY=YuksalishAdminProductionKey2026
ADMIN_USERNAME=Yuksalish2026
ADMIN_PASSWORD=20062601

# Gemini AI
GEMINI_API_KEY=AIzaSyCIljOkkDv3v-sgoY3MwUaTvRNy88BVl_U
GEMINI_API_KEY_2=AIzaSyCHfS29T76z10RCAQTcrynd_k4V-lpTa88
EOF
echo ".env created"

# ── 5. Build & start containers ─────────────────────────────
echo "[5/7] Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting 60s for services to become healthy..."
sleep 60

echo "Running DB migrations..."
docker exec yuksalish_backend npx prisma migrate deploy || echo "Migration warning (may already be up-to-date)"

# ── 6. Nginx (host-level reverse proxy) ─────────────────────
echo "[6/7] Configuring Nginx..."
cp nginx/it-jobs.bekmuhammad.uz /etc/nginx/sites-available/it-jobs.bekmuhammad.uz
ln -sf /etc/nginx/sites-available/it-jobs.bekmuhammad.uz /etc/nginx/sites-enabled/it-jobs.bekmuhammad.uz
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx
echo "Nginx configured."

# ── 7. SSL certificate via Certbot ──────────────────────────
echo "[7/7] Obtaining SSL certificate..."
certbot --nginx \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  -m "$EMAIL" \
  --redirect
echo "SSL certificate obtained."

# ── Done ────────────────────────────────────────────────────
echo ""
echo "======================================"
echo "  Deploy complete!"
echo "  Site: https://$DOMAIN"
echo "  Admin: https://$DOMAIN/admin"
echo "  API:   https://$DOMAIN/api"
echo "======================================"
echo ""
echo "Useful commands:"
echo "  docker compose -f /opt/it-jobs/docker-compose.prod.yml logs -f"
echo "  docker compose -f /opt/it-jobs/docker-compose.prod.yml ps"
echo "  docker compose -f /opt/it-jobs/docker-compose.prod.yml restart backend"
