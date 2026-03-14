import { NextResponse } from "next/server";
import { dbAll } from "@/lib/data/atlas-db";

export async function GET() {
  const brands = dbAll<Record<string, unknown>>(
    `SELECT b.*, COUNT(m.id) as model_count
     FROM brands b
     LEFT JOIN models m ON m.brand_id = b.id
     GROUP BY b.id
     ORDER BY b.name`
  );
  return NextResponse.json({ brands });
}
