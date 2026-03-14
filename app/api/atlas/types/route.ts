import { NextResponse } from "next/server";
import { dbAll } from "@/lib/data/atlas-db";

export async function GET() {
  const types = dbAll<Record<string, unknown>>(
    `SELECT t.*, COUNT(m.id) as model_count
     FROM types t
     LEFT JOIN models m ON m.type_id = t.id
     GROUP BY t.id
     ORDER BY t.name`
  );
  return NextResponse.json({ types });
}
