import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const DB_FILENAME = "bas-atlas.db";
const REMOTE_URL =
  "https://github.com/rbhans/bas-atlas/raw/main/dist/bas-atlas.db";

let db: Database.Database | null = null;

function findDbPath(): string {
  // 1. Check local/bundled locations first (works in dev + if Vercel tracing works)
  const candidates = [
    path.join(process.cwd(), "data", DB_FILENAME),
    path.join(process.cwd(), ".next", "server", "data", DB_FILENAME),
  ];

  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    candidates.push(path.join(dir, "data", DB_FILENAME));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // 2. On Vercel (or any env where bundling failed), download to /tmp
  const tmpPath = path.join("/tmp", DB_FILENAME);
  if (fs.existsSync(tmpPath)) return tmpPath;

  console.log(`[atlas-db] DB not found locally, downloading to ${tmpPath}...`);
  execSync(`curl -L -f -o "${tmpPath}" "${REMOTE_URL}"`, {
    timeout: 15000,
  });

  if (!fs.existsSync(tmpPath)) {
    throw new Error(
      `[atlas-db] Failed to download DB. cwd=${process.cwd()}, __dirname=${__dirname}`
    );
  }

  const size = fs.statSync(tmpPath).size;
  console.log(`[atlas-db] Downloaded ${size} bytes to ${tmpPath}`);
  return tmpPath;
}

export function getAtlasDb(): Database.Database {
  if (!db) {
    const dbPath = findDbPath();
    db = new Database(dbPath, { readonly: true });
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

// Typed query helpers
export function dbAll<T>(sql: string, ...params: unknown[]): T[] {
  return getAtlasDb().prepare(sql).all(...params) as T[];
}

export function dbGet<T>(sql: string, ...params: unknown[]): T | undefined {
  return getAtlasDb().prepare(sql).get(...params) as T | undefined;
}
