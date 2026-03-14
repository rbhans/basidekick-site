import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/data/atlas-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const model = dbGet<Record<string, unknown>>(
    `SELECT m.*, b.name as brand_name, b.slug as brand_slug,
            t.name as type_name, t.slug as type_slug
     FROM models m
     JOIN brands b ON b.id = m.brand_id
     JOIN types t ON t.id = m.type_id
     WHERE m.id = ? OR m.slug = ?`,
    id, id
  );
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  const model_numbers = dbAll<{ model_number: string }>(
    "SELECT model_number FROM model_numbers WHERE model_id = ?",
    model.id
  ).map((r) => r.model_number);

  const protocols = dbAll<{ protocol: string }>(
    "SELECT protocol FROM model_protocols WHERE model_id = ?",
    model.id
  ).map((r) => r.protocol);

  return NextResponse.json({ ...model, model_numbers, protocols });
}
