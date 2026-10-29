#!/usr/bin/env bash
# Run this on an Ubuntu server AFTER the site files are in APP_DIR.
# Usage:
#   DOMAIN=portfolio.example.com EMAIL=you@example.com sudo -E bash deploy/cloud-server-setup.sh
set -euo pipefail

: "${DOMAIN:?Set DOMAIN, e.g. portfolio.example.com}"
: "${EMAIL:?Set EMAIL for Let's Encrypt}"
APP_DIR="${APP_DIR:-/var/www/portfolio}"

if [[ ! -f "$APP_DIR/index.html" ]]; then
  echo "ERROR: $APP_DIR/index.html not found. Upload the site first." >&2
  exit 1
fi

sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx ufw

sudo tee /etc/nginx/sites-available/portfolio >/dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${APP_DIR};
    index index.html;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~* \\.(css|js|png|svg|jpg|jpeg|webp|ico)\$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
}
EOF

sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo "Done: https://${DOMAIN}/"
