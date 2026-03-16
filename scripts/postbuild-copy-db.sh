#!/bin/bash
set -e

DB_SRC="data/bas-atlas.db"
DB_DEST=".next/server/data/bas-atlas.db"

if [ ! -f "$DB_SRC" ]; then
  echo "[postbuild] WARNING: $DB_SRC not found, skipping copy"
  exit 0
fi

mkdir -p "$(dirname "$DB_DEST")"
cp "$DB_SRC" "$DB_DEST"
echo "[postbuild] Copied $DB_SRC -> $DB_DEST ($(wc -c < "$DB_DEST") bytes)"
