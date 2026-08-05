#!/usr/bin/env bash
# Dumps the production database (via .env.production DATABASE_URL) into the
# local postgres pod at /tmp/prod_dump.sql. Load it locally with
# restore-prod-dump.sh.
#
# Usage: ./scripts/dump-prod.sh
set -euo pipefail

if [ ! -f .env.production ]; then
  echo "Error: .env.production not found in $(pwd). Run this script from the project root." >&2
  exit 1
fi

if ! grep -q '^DATABASE_URL=' .env.production; then
  echo "Error: DATABASE_URL not set in .env.production" >&2
  exit 1
fi

PROD_URL="$(grep '^DATABASE_URL=' .env.production | cut -d= -f2- | tr -d '"')&sslmode=require"
CONTAINER="website_postgres_1"
DUMP_PATH="/tmp/prod_dump.sql"

# pg_dump se conecta a Neon, no al Postgres del pod — el pod solo aporta el
# binario y el disco. Por eso `podman logs` no muestra NADA durante el dump:
# el servidor local no participa. El unico progreso real es el archivo creciendo.
echo "Generando dump de prod. Progreso (el archivo se trunca y crece de cero):"

podman exec "$CONTAINER" pg_dump "$PROD_URL" --no-owner --no-privileges -f "$DUMP_PATH" &
DUMP_PID=$!

while kill -0 "$DUMP_PID" 2>/dev/null; do
  SIZE="$(podman exec "$CONTAINER" ls -lh "$DUMP_PATH" 2>/dev/null | awk '{print $5}')"
  printf '\r  %s escritos...' "${SIZE:-0}"
  sleep 2
done
printf '\r'

wait "$DUMP_PID"

FINAL_SIZE="$(podman exec "$CONTAINER" ls -lh "$DUMP_PATH" | awk '{print $5}')"
echo "Dump generado en el pod $CONTAINER, path $DUMP_PATH ($FINAL_SIZE)"
