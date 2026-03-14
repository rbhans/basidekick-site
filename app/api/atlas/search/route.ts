import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/data/atlas-db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // FTS5 search
  const results = dbAll<{
    entry_id: string;
    entry_type: string;
    name: string;
    rank: number;
  }>(
    `SELECT entry_id, entry_type, name, rank
     FROM search_index
     WHERE search_index MATCH ?
     ORDER BY rank
     LIMIT 50`,
    q + "*"
  );

  return NextResponse.json({ results, query: q });
}
