import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet, parseLimit, parseOffset } from "@/lib/data/atlas-db";

interface PointRow {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  kind: string | null;
  point_function: string | null;
  haystack_tag_string: string | null;
  brick: string | null;
  alias_count: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const kind = searchParams.get("kind");
  const pointFunction = searchParams.get("point_function");
  const q = searchParams.get("q");
  const limit = parseLimit(searchParams.get("limit"), 500, 1000);
  const offset = parseOffset(searchParams.get("offset"));

  let sql = "SELECT *, (SELECT COUNT(*) FROM point_aliases WHERE point_id = points.id) AS alias_count FROM points WHERE 1=1";
  const params: unknown[] = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (kind) {
    sql += " AND kind = ?";
    params.push(kind);
  }
  if (pointFunction) {
    sql += " AND point_function = ?";
    params.push(pointFunction);
  }
  if (q) {
    sql += ` AND (name LIKE ? OR id LIKE ?
      OR id IN (SELECT point_id FROM point_aliases WHERE alias LIKE ?))`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const total = dbGet<{ c: number }>(
    sql.replace("SELECT *", "SELECT COUNT(*) as c"),
    ...params
  )?.c ?? 0;

  sql += " ORDER BY name LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const points = dbAll<PointRow>(sql, ...params);

  return NextResponse.json({ points, total, limit, offset });
}
