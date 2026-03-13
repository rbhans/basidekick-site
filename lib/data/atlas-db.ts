import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getAtlasDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "bas-atlas.db");
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
