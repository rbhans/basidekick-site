import { NextResponse } from "next/server";
import { dbAll } from "@/lib/data/atlas-db";
import type { BabelCategory } from "@/lib/types";

export async function GET() {
  // Build categories from DB by counting points and equipment per category
  const pointCategories = dbAll<{ category: string; count: number }>(
    "SELECT category, COUNT(*) as count FROM points GROUP BY category ORDER BY category"
  );
  const equipCategories = dbAll<{ category: string; count: number }>(
    "SELECT category, COUNT(*) as count FROM equipment GROUP BY category ORDER BY category"
  );

  const categories: BabelCategory[] = [
    ...pointCategories.map((c) => ({
      id: c.category,
      name: c.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      type: "points" as const,
      count: c.count,
    })),
    ...equipCategories.map((c) => ({
      id: c.category,
      name: c.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      type: "equipment" as const,
      count: c.count,
    })),
  ];

  return NextResponse.json({ version: "1.0.0", categories });
}
