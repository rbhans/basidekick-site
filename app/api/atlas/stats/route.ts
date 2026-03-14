import { NextResponse } from "next/server";
import { dbGet } from "@/lib/data/atlas-db";

export async function GET() {
  const stats = {
    totalPoints: dbGet<{ c: number }>("SELECT COUNT(*) as c FROM points")?.c ?? 0,
    totalEquipment: dbGet<{ c: number }>("SELECT COUNT(*) as c FROM equipment")?.c ?? 0,
    totalBrands: dbGet<{ c: number }>("SELECT COUNT(*) as c FROM brands")?.c ?? 0,
    totalTypes: dbGet<{ c: number }>("SELECT COUNT(*) as c FROM types")?.c ?? 0,
    totalModels: dbGet<{ c: number }>("SELECT COUNT(*) as c FROM models")?.c ?? 0,
    totalLinks: dbGet<{ c: number }>("SELECT COUNT(*) as c FROM equipment_typical_points")?.c ?? 0,
  };

  return NextResponse.json(stats);
}
