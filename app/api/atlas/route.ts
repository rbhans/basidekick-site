import { NextResponse } from "next/server";
import { dbGet } from "@/lib/data/atlas-db";

export async function GET() {
  const count = (sql: string) => dbGet<{ c: number }>(sql)?.c ?? 0;

  return NextResponse.json({
    name: "BAS Atlas API",
    version: "1.0.0",
    description:
      "Unified BAS point naming standards, equipment catalog, and model reference data for building automation systems.",
    data: {
      equipment: count("SELECT COUNT(*) as c FROM equipment"),
      points: count("SELECT COUNT(*) as c FROM points"),
      models: count("SELECT COUNT(*) as c FROM models"),
      brands: count("SELECT COUNT(*) as c FROM brands"),
    },
    endpoints: {
      "GET /api/atlas": "This index",
      "GET /api/atlas/stats": "Database statistics and facet breakdowns",
      "GET /api/atlas/search?q=": "Full-text search across all data (supports aliases). Optional: type=point|equipment|model|brand, limit=50",
      "GET /api/atlas/equipment": "List equipment. Optional: category=, q= (searches aliases)",
      "GET /api/atlas/equipment-detail/:id": "Equipment detail with aliases, haystack tags, subtypes, typical points, and compatible models",
      "GET /api/atlas/points": "List points. Optional: category=, kind=Number|Bool, point_function=sensor|command|setpoint|alarm|status|enable, q= (searches aliases)",
      "GET /api/atlas/points/:id": "Point detail with aliases, units, states, haystack tags, related points, and equipment usage",
      "GET /api/atlas/brands": "List all brands with model counts",
      "GET /api/atlas/types": "List all model types with model counts",
      "GET /api/atlas/models": "List models. Optional: brand=, type=",
      "GET /api/atlas/models/:id": "Model detail with protocols, model numbers, and equipment links",
      "GET /api/atlas/graph": "Equipment-point relationship graph. Optional: root=:id, depth=1-3",
    },
    cors: "All /api/atlas/* endpoints support CORS (Access-Control-Allow-Origin: *)",
    source: "https://github.com/basidekick/bas-atlas",
  });
}
