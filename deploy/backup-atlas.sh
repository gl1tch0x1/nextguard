#!/usr/bin/env sh
set -eu
: "${MONGODB_URI:?Set MONGODB_URI for the production database}"
: "${BACKUP_DIR:=./backups}"
mkdir -p "$BACKUP_DIR"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$BACKUP_DIR/nexguard-$stamp.archive.gz"
# Requires MongoDB Database Tools (mongodump). Keep backups encrypted and access-restricted.
mongodump --uri="$MONGODB_URI" --archive="$archive" --gzip
chmod 600 "$archive"
printf 'Backup created: %s\n' "$archive"
