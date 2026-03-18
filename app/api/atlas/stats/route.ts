import { NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/data/atlas-db";

export async function GET() {
  const count = (sql: string) => dbGet<{ c: number }>(sql)?.c ?? 0;

  const stats = {
    totalPoints: count("SELECT COUNT(*) as c FROM points"),
    totalEquipment: count("SELECT COUNT(*) as c FROM equipment"),
    totalBrands: count("SELECT COUNT(*) as c FROM brands"),
    totalTypes: count("SELECT COUNT(*) as c FROM types"),
    totalModels: count("SELECT COUNT(*) as c FROM models"),
    totalLinks: count("SELECT COUNT(*) as c FROM equipment_typical_points"),
    totalSubtypes: count("SELECT COUNT(*) as c FROM equipment_subtypes"),
    totalPointAliases: count("SELECT COUNT(*) as c FROM point_aliases"),
    totalPointUnits: count("SELECT COUNT(DISTINCT point_id) as c FROM point_units"),
    totalPointStates: count("SELECT COUNT(DISTINCT point_id) as c FROM point_states"),
    totalRelatedPoints: count("SELECT COUNT(*) as c FROM point_related"),
    totalModelProtocols: count("SELECT COUNT(DISTINCT model_id) as c FROM model_protocols"),
    pointCategories: dbAll<{ category: string; count: number }>(
      "SELECT category, COUNT(*) as count FROM points GROUP BY category ORDER BY count DESC"
    ),
    equipmentCategories: dbAll<{ category: string; count: number }>(
      "SELECT category, COUNT(*) as count FROM equipment GROUP BY category ORDER BY count DESC"
    ),
    pointFunctions: dbAll<{ point_function: string; count: number }>(
      "SELECT point_function, COUNT(*) as count FROM points GROUP BY point_function ORDER BY count DESC"
    ),
  };

  return NextResponse.json(stats);
}
