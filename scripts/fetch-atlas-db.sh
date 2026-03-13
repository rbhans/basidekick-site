#!/bin/bash
set -e

DB_DIR="data"
DB_PATH="$DB_DIR/bas-atlas.db"
REMOTE_URL="https://github.com/rbhans/bas-atlas/raw/main/dist/bas-atlas.db"

mkdir -p "$DB_DIR"

if [ -f "$DB_PATH" ] && [ "$SKIP_DB_FETCH" = "true" ]; then
  echo "Skipping DB fetch (SKIP_DB_FETCH=true)"
  exit 0
fi

echo "Downloading bas-atlas.db from GitHub..."
curl -L -f -o "$DB_PATH" "$REMOTE_URL"
echo "Downloaded bas-atlas.db ($(wc -c < "$DB_PATH") bytes)"
