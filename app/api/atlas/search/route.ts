import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/data/atlas-db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const type = request.nextUrl.searchParams.get("type");
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 200);
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Sanitize FTS query — escape special chars, append wildcard
  const ftsQuery = q.replace(/['"*(){}[\]^~\\:!-]/g, " ").trim();
  if (!ftsQuery) return NextResponse.json({ results: [] });

  let sql = `SELECT entry_id, entry_type, name, rank
     FROM search_index
     WHERE search_index MATCH ?`;
  const params: unknown[] = [ftsQuery + "*"];

  if (type) {
    sql += " AND entry_type = ?";
    params.push(type);
  }

  sql += " ORDER BY rank LIMIT ?";
  params.push(limit);

  const results = dbAll<{
    entry_id: string;
    entry_type: string;
    name: string;
    rank: number;
  }>(sql, ...params);

  // Enrich results with category/kind where available
  const enriched = results.map((r) => {
    if (r.entry_type === "point") {
      const p = dbGet<{ category: string; kind: string; point_function: string }>(
        "SELECT category, kind, point_function FROM points WHERE id = ?", r.entry_id
      );
      return { ...r, category: p?.category, kind: p?.kind, point_function: p?.point_function };
    }
    if (r.entry_type === "equipment") {
      const e = dbGet<{ category: string; abbreviation: string }>(
        "SELECT category, abbreviation FROM equipment WHERE id = ?", r.entry_id
      );
      return { ...r, category: e?.category, abbreviation: e?.abbreviation };
    }
    if (r.entry_type === "model") {
      const m = dbGet<{ brand_name: string; type_name: string }>(
        `SELECT b.name as brand_name, t.name as type_name FROM models m
         JOIN brands b ON b.id = m.brand_id JOIN types t ON t.id = m.type_id
         WHERE m.id = ?`, r.entry_id
      );
      return { ...r, brand_name: m?.brand_name, type_name: m?.type_name };
    }
    return r;
  });

  return NextResponse.json({ results: enriched, query: q });
}
