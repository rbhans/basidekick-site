import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const DB_FILENAME = "bas-atlas.db";
const REMOTE_URL =
  "https://github.com/rbhans/bas-atlas/raw/main/dist/bas-atlas.db";

let db: Database.Database | null = null;

function getDbPath(): string {
  const tmpPath = path.join("/tmp", DB_FILENAME);

  // Warm Lambda — already in /tmp from a previous invocation
  if (fs.existsSync(tmpPath)) return tmpPath;

  // Find a bundled/local copy
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

  for (const src of candidates) {
    if (fs.existsSync(src)) {
      // Local dev: use directly (writable filesystem)
      if (!process.env.VERCEL) return src;
      // Vercel: copy to /tmp (Lambda bundle dir is read-only)
      fs.copyFileSync(src, tmpPath);
      console.log(`[atlas-db] Copied ${src} -> ${tmpPath} (${fs.statSync(tmpPath).size} bytes)`);
      return tmpPath;
    }
  }

  // Nothing bundled — download from GitHub to /tmp
  console.log(`[atlas-db] DB not bundled, downloading to ${tmpPath}...`);
  execSync(`curl -L -f -o "${tmpPath}" "${REMOTE_URL}"`, { timeout: 15000 });

  if (!fs.existsSync(tmpPath)) {
    throw new Error(
      `[atlas-db] DB not found. cwd=${process.cwd()}, __dirname=${__dirname}`
    );
  }
  console.log(`[atlas-db] Downloaded ${fs.statSync(tmpPath).size} bytes -> ${tmpPath}`);
  return tmpPath;
}

export function getAtlasDb(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    db = new Database(dbPath, { readonly: true });
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function dbAll<T>(sql: string, ...params: unknown[]): T[] {
  return getAtlasDb().prepare(sql).all(...params) as T[];
}

export function dbGet<T>(sql: string, ...params: unknown[]): T | undefined {
  return getAtlasDb().prepare(sql).get(...params) as T | undefined;
}

/**
 * Parse a `limit` query param into a bounded positive integer. Guards against
 * non-numeric input (NaN would crash better-sqlite3 with a datatype mismatch)
 * and negative values (LIMIT -1 means "unlimited" in SQLite, bypassing the cap).
 */
export function parseLimit(raw: string | null, fallback: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 1), max);
}

/** Parse an `offset` query param into a non-negative integer. */
export function parseOffset(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(n, 0);
}
