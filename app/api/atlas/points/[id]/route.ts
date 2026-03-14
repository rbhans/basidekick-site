import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/data/atlas-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const point = dbGet<Record<string, unknown>>(
    "SELECT * FROM points WHERE id = ?",
    id
  );
  if (!point) {
    return NextResponse.json({ error: "Point not found" }, { status: 404 });
  }

  const aliases = dbAll<{ alias: string; alias_group: string }>(
    "SELECT alias, alias_group FROM point_aliases WHERE point_id = ?",
    id
  );

  const units = dbAll<{ unit: string }>(
    "SELECT unit FROM point_units WHERE point_id = ?",
    id
  );

  const tags = dbAll<{ tag_name: string; tag_kind: string }>(
    "SELECT tag_name, tag_kind FROM point_haystack_tags WHERE point_id = ?",
    id
  );

  const states = dbAll<{ state_key: string; state_value: string }>(
    "SELECT state_key, state_value FROM point_states WHERE point_id = ?",
    id
  );

  const notes = dbAll<{ note: string }>(
    "SELECT note FROM point_notes WHERE point_id = ?",
    id
  );

  const related = dbAll<{ related_point_id: string }>(
    "SELECT related_point_id FROM point_related WHERE point_id = ?",
    id
  );

  // Equipment that uses this point
  const equipment = dbAll<{ equipment_id: string; name: string; category: string }>(
    `SELECT e.id as equipment_id, e.name, e.category
     FROM equipment_typical_points etp
     JOIN equipment e ON e.id = etp.equipment_id
     WHERE etp.point_id = ?
     ORDER BY e.name`,
    id
  );

  return NextResponse.json({
    ...point,
    aliases,
    units: units.map((u) => u.unit),
    tags,
    states,
    notes: notes.map((n) => n.note),
    related: related.map((r) => r.related_point_id),
    equipment,
  });
}
