import { cache } from "react";
import { dbAll, dbGet } from "@/lib/data/atlas-db";
import type { BabelData, BabelEquipmentEntry, BabelPointEntry } from "@/lib/types";

export const getBabelData = cache(async (): Promise<BabelData | null> => {
  try {
    const points = dbAll<Record<string, unknown>>("SELECT * FROM points ORDER BY name");
    const equipment = dbAll<Record<string, unknown>>("SELECT * FROM equipment ORDER BY name");

    const babelPoints: BabelPointEntry[] = points.map((p) => ({
      concept: {
        id: p.id as string,
        name: p.name as string,
        category: p.category as string,
        subcategory: p.subcategory as string | undefined,
        description: (p.description as string) ?? "",
        kind: p.kind as string | undefined,
        point_function: p.point_function as string | undefined,
        haystack: p.haystack_tag_string
          ? {
              tagString: p.haystack_tag_string as string,
              tags: dbAll<{ tag_name: string; tag_kind: string }>(
                "SELECT tag_name, tag_kind FROM point_haystack_tags WHERE point_id = ?",
                p.id
              ).map((t) => ({ name: t.tag_name, kind: t.tag_kind as "Marker" })),
              markers: (p.haystack_tag_string as string).split(" "),
              unit: p.haystack_unit as string | undefined,
              kind: p.haystack_kind as string | undefined,
            }
          : undefined,
        brick: p.brick as string | undefined,
      },
      aliases: buildAliases("point_aliases", "point_id", p.id as string),
      notes:
        dbAll<{ note: string }>(
          "SELECT note FROM point_notes WHERE point_id = ?",
          p.id
        ).map((n) => n.note) || undefined,
      related:
        dbAll<{ related_point_id: string }>(
          "SELECT related_point_id FROM point_related WHERE point_id = ?",
          p.id
        ).map((r) => r.related_point_id) || undefined,
    }));

    const babelEquipment: BabelEquipmentEntry[] = equipment.map((e) => ({
      id: e.id as string,
      name: e.name as string,
      full_name: e.full_name as string | undefined,
      abbreviation: e.abbreviation as string | undefined,
      category: e.category as string,
      description: (e.description as string) ?? "",
      haystack: e.haystack_tag_string
        ? {
            tagString: e.haystack_tag_string as string,
            tags: dbAll<{ tag_name: string; tag_kind: string }>(
              "SELECT tag_name, tag_kind FROM equipment_haystack_tags WHERE equipment_id = ?",
              e.id
            ).map((t) => ({ name: t.tag_name, kind: t.tag_kind as "Marker" })),
            markers: (e.haystack_tag_string as string).split(" "),
          }
        : undefined,
      brick: e.brick as string | undefined,
      aliases: buildAliases("equipment_aliases", "equipment_id", e.id as string),
      subtypes: dbAll<{ id: string; name: string; description: string | null }>(
        "SELECT subtype_id as id, subtype_name as name, description FROM equipment_subtypes WHERE equipment_id = ?",
        e.id
      ).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description ?? undefined,
        aliases:
          dbAll<{ alias: string }>(
            "SELECT alias FROM equipment_subtype_aliases WHERE subtype_id = ? AND equipment_id = ?",
            s.id,
            e.id
          ).map((a) => a.alias) || undefined,
      })),
      typical_points: dbAll<{ point_id: string }>(
        "SELECT point_id FROM equipment_typical_points WHERE equipment_id = ?",
        e.id
      ).map((r) => r.point_id),
    }));

    const meta = dbGet<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'lastUpdated'"
    );

    return {
      version: "1.0.0",
      lastUpdated: meta?.value ?? new Date().toISOString(),
      totalPoints: babelPoints.length,
      totalEquipment: babelEquipment.length,
      points: babelPoints,
      equipment: babelEquipment,
    };
  } catch {
    return null;
  }
});

function buildAliases(table: string, fkColumn: string, id: string) {
  const rows = dbAll<{ alias: string; alias_group: string }>(
    `SELECT alias, alias_group FROM ${table} WHERE ${fkColumn} = ?`,
    id
  );
  const common = rows.filter((r) => r.alias_group === "common").map((r) => r.alias);
  const misspellings = rows
    .filter((r) => r.alias_group === "misspellings")
    .map((r) => r.alias);
  return {
    common: common.length > 0 ? common : [],
    misspellings: misspellings.length > 0 ? misspellings : undefined,
  };
}

export type BabelEntryLookup = {
  data: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
};

export const getBabelEntry = cache(
  async (id: string): Promise<BabelEntryLookup | null> => {
    const data = await getBabelData();
    if (!data || !id) return null;

    const pointEntry = data.points.find((point) => point.concept.id === id);
    if (pointEntry) return { data: pointEntry, type: "point" };

    const equipmentEntry = data.equipment.find((equipment) => equipment.id === id);
    if (equipmentEntry) return { data: equipmentEntry, type: "equipment" };

    return null;
  }
);

export const getAllBabelIds = cache(async (): Promise<string[]> => {
  const pointIds = dbAll<{ id: string }>("SELECT id FROM points").map((r) => r.id);
  const equipIds = dbAll<{ id: string }>("SELECT id FROM equipment").map((r) => r.id);
  return [...pointIds, ...equipIds];
});
