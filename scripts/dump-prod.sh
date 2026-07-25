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

echo "Generando dump de prod. Para ver el estado en otra terminal: podman logs -f $CONTAINER"
podman exec "$CONTAINER" pg_dump "$PROD_URL" --no-owner --no-privileges -f "$DUMP_PATH"

echo "Dump generado en el pod $CONTAINER, path $DUMP_PATH"
