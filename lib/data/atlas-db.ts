import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

function findDbPath(): string {
  const candidates = [
    // Standard: works in local dev and when Vercel tracing works correctly
    path.join(process.cwd(), "data", "bas-atlas.db"),
    // Postbuild copy location (belt-and-suspenders for Vercel)
    path.join(process.cwd(), ".next", "server", "data", "bas-atlas.db"),
  ];

  // Also walk up from __dirname (where the compiled route handler lives)
  // .nft.json traces are relative to the route file, so this finds the DB
  // even if process.cwd() doesn't match the bundle root
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    candidates.push(path.join(dir, "data", "bas-atlas.db"));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error(
    `[atlas-db] DB not found. cwd=${process.cwd()}, __dirname=${__dirname}, candidates=${candidates.join(", ")}`
  );
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
