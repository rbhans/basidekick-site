import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet, parseLimit, parseOffset } from "@/lib/data/atlas-db";

interface EquipRow {
  id: string;
  name: string;
  full_name: string | null;
  abbreviation: string | null;
  category: string;
  description: string | null;
  haystack_tag_string: string | null;
  brick: string | null;
  parent_id: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const limit = parseLimit(searchParams.get("limit"), 500, 1000);
  const offset = parseOffset(searchParams.get("offset"));

  let sql = "SELECT * FROM equipment WHERE 1=1";
  const params: unknown[] = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += ` AND (name LIKE ? OR id LIKE ? OR abbreviation LIKE ?
      OR id IN (SELECT equipment_id FROM equipment_aliases WHERE alias LIKE ?))`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const total = dbGet<{ c: number }>(
    sql.replace("SELECT *", "SELECT COUNT(*) as c"),
    ...params
  )?.c ?? 0;

  sql += " ORDER BY name LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const equipment = dbAll<EquipRow>(sql, ...params);

  // Add counts for each
  const withCounts = equipment.map((e) => ({
    ...e,
    typical_point_count: dbGet<{ c: number }>(
      "SELECT COUNT(*) as c FROM equipment_typical_points WHERE equipment_id = ?",
      e.id
    )?.c ?? 0,
    subtype_count: dbGet<{ c: number }>(
      "SELECT COUNT(*) as c FROM equipment_subtypes WHERE equipment_id = ?",
      e.id
    )?.c ?? 0,
    model_count: dbGet<{ c: number }>(
      "SELECT COUNT(*) as c FROM model_equipment WHERE equipment_id = ?",
      e.id
    )?.c ?? 0,
  }));

  return NextResponse.json({ equipment: withCounts, total, limit, offset });
}
