#!/bin/bash
set -e

DB_SRC="data/bas-atlas.db"
DB_DEST=".next/server/data/bas-atlas.db"

if [ ! -f "$DB_SRC" ]; then
  echo "[postbuild] WARNING: $DB_SRC not found, skipping copy"
  exit 0
fi

# Copy DB into .next/server/data/ so it's alongside compiled routes
mkdir -p "$(dirname "$DB_DEST")"
cp "$DB_SRC" "$DB_DEST"
echo "[postbuild] Copied $DB_SRC -> $DB_DEST ($(wc -c < "$DB_DEST") bytes)"

# Patch .nft.json files to include the DB path.
# Turbopack ignores outputFileTracingIncludes, so the .nft.json files
# generated on Vercel don't reference the DB. Vercel's tracing step
# only bundles files listed in .nft.json, so we inject the DB path.
node -e "
const fs = require('fs');
const path = require('path');
const glob = require('path');

function findNftFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findNftFiles(full));
    } else if (entry.name.endsWith('.nft.json')) {
      results.push(full);
    }
  }
  return results;
}

const nftFiles = findNftFiles('.next/server/app/api/atlas');
let patched = 0;

for (const nft of nftFiles) {
  const data = JSON.parse(fs.readFileSync(nft, 'utf8'));
  const hasDb = data.files.some(f => f.includes('bas-atlas.db'));

  if (hasDb) {
    console.log('[postbuild] ' + nft + ' already references DB');
    patched++;
    continue;
  }

  // Compute relative path from the .nft.json directory to data/bas-atlas.db
  const nftDir = path.dirname(nft);
  const relPath = path.relative(nftDir, 'data/bas-atlas.db');
  data.files.push(relPath);
  fs.writeFileSync(nft, JSON.stringify(data));
  console.log('[postbuild] Patched ' + nft + ' with ' + relPath);
  patched++;
}

console.log('[postbuild] Processed ' + patched + ' .nft.json files');
"
