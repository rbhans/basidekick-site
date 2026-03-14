import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/data/atlas-db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const brand = searchParams.get("brand");
  const type = searchParams.get("type");

  let sql = `SELECT m.*, b.name as brand_name, b.slug as brand_slug,
                    t.name as type_name, t.slug as type_slug
             FROM models m
             JOIN brands b ON b.id = m.brand_id
             JOIN types t ON t.id = m.type_id
             WHERE 1=1`;
  const params: unknown[] = [];

  if (brand) {
    sql += " AND (b.slug = ? OR b.id = ?)";
    params.push(brand, brand);
  }
  if (type) {
    sql += " AND (t.slug = ? OR t.id = ?)";
    params.push(type, type);
  }

  sql += " ORDER BY m.name";
  const models = dbAll<Record<string, unknown>>(sql, ...params);

  // Attach model_numbers and protocols
  const enriched = models.map((m: Record<string, unknown>) => ({
    ...m,
    model_numbers: dbAll<{ model_number: string }>(
      "SELECT model_number FROM model_numbers WHERE model_id = ?",
      m.id
    ).map((r) => r.model_number),
    protocols: dbAll<{ protocol: string }>(
      "SELECT protocol FROM model_protocols WHERE model_id = ?",
      m.id
    ).map((r) => r.protocol),
  }));

  return NextResponse.json({ models: enriched });
}
