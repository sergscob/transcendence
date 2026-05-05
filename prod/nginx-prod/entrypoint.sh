#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CRT_PATH="$CERT_DIR/selfsigned.crt"
KEY_PATH="$CERT_DIR/selfsigned.key"

mkdir -p "$CERT_DIR"

if [ ! -f "$CRT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
  echo "Generating self-signed TLS certificate..."
  openssl req -x509 -nodes -days "365" -newkey rsa:2048 \
    -keyout "$KEY_PATH" \
    -out "$CRT_PATH" \
    -subj "/CN=localhost"
fi

exec nginx -g "daemon off;"
