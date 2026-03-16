import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/data/atlas-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const equip = dbGet<Record<string, unknown>>(
    "SELECT * FROM equipment WHERE id = ?",
    id
  );
  if (!equip) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
  }

  const aliases = dbAll<{ alias: string; alias_group: string }>(
    "SELECT alias, alias_group FROM equipment_aliases WHERE equipment_id = ?",
    id
  );

  const tags = dbAll<{ tag_name: string; tag_kind: string }>(
    "SELECT tag_name, tag_kind FROM equipment_haystack_tags WHERE equipment_id = ?",
    id
  );

  const subtypes = dbAll<{
    subtype_id: string;
    subtype_name: string;
    description: string | null;
  }>(
    "SELECT subtype_id as id, subtype_name as name, description FROM equipment_subtypes WHERE equipment_id = ?",
    id
  );

  // Typical points with full detail
  const typicalPoints = dbAll<{
    id: string;
    name: string;
    category: string;
    kind: string | null;
    point_function: string | null;
    haystack_tag_string: string | null;
    description: string | null;
  }>(
    `SELECT p.id, p.name, p.category, p.kind, p.point_function,
            p.haystack_tag_string, p.description
     FROM equipment_typical_points etp
     JOIN points p ON p.id = etp.point_id
     WHERE etp.equipment_id = ?
     ORDER BY p.category, p.name`,
    id
  );

  // Models that work with this equipment
  const models = dbAll<{
    id: string;
    name: string;
    slug: string | null;
    brand_name: string;
    brand_slug: string | null;
    type_name: string;
    description: string | null;
    status: string | null;
  }>(
    `SELECT m.id, m.name, m.slug, b.name as brand_name, b.slug as brand_slug,
            t.name as type_name, m.description, m.status
     FROM model_equipment me
     JOIN models m ON m.id = me.model_id
     JOIN brands b ON b.id = m.brand_id
     JOIN types t ON t.id = m.type_id
     WHERE me.equipment_id = ?
     ORDER BY b.name, m.name`,
    id
  );

  return NextResponse.json({
    ...equip,
    aliases,
    tags,
    subtypes,
    typical_points: typicalPoints,
    models,
  });
}
