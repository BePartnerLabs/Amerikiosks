#!/usr/bin/env bash
# Restores /tmp/prod_dump.sql (from dump-prod.sh) into the local dev database,
# overwriting it. Backs up the current local database first so it can be
# restored if something goes wrong.
#
# Usage: ./scripts/restore-prod-dump.sh
set -euo pipefail

CONTAINER="website_postgres_1"
PG_USER="payload"
LOCAL_DB="amerikiosks"
DUMP_PATH="/tmp/prod_dump.sql"
BACKUP_PATH="/tmp/local_backup_$(date +%Y%m%d_%H%M%S).sql"

if ! podman exec "$CONTAINER" test -f "$DUMP_PATH"; then
  echo "Error: $DUMP_PATH not found in pod $CONTAINER. Run ./scripts/dump-prod.sh first." >&2
  exit 1
fi

echo "Respaldando la base local $LOCAL_DB en $BACKUP_PATH por si algo falla..."
echo "Para ver el estado en otra terminal: podman logs -f $CONTAINER"
podman exec "$CONTAINER" pg_dump -U "$PG_USER" --no-owner --no-privileges -f "$BACKUP_PATH" "$LOCAL_DB"
echo "Backup local guardado en el pod $CONTAINER, path $BACKUP_PATH"

podman exec "$CONTAINER" dropdb -U "$PG_USER" "$LOCAL_DB"
podman exec "$CONTAINER" createdb -U "$PG_USER" "$LOCAL_DB"

echo "Restaurando dump de prod. Para ver el estado en otra terminal:"
echo "  podman exec $CONTAINER psql -U $PG_USER -d $LOCAL_DB -c \"SELECT count(*) FROM pg_stat_activity WHERE datname = '$LOCAL_DB';\""
podman exec "$CONTAINER" psql -U "$PG_USER" -d "$LOCAL_DB" -f "$DUMP_PATH" -v ON_ERROR_STOP=1

echo "Dump de prod restaurado en la base local $LOCAL_DB dentro del pod $CONTAINER"
echo "Si algo salio mal, restaura el backup con:"
echo "  podman exec $CONTAINER dropdb -U $PG_USER $LOCAL_DB && podman exec $CONTAINER createdb -U $PG_USER $LOCAL_DB && podman exec $CONTAINER psql -U $PG_USER -d $LOCAL_DB -f $BACKUP_PATH"
