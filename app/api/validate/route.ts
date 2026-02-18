import { NextRequest, NextResponse } from "next/server";
import { getBasResources } from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { validatePointList } from "@/lib/api/bas-logic";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, { max: 60 });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const equipmentTypeId = typeof body?.equipmentTypeId === "string" ? body.equipmentTypeId.trim() : "";
  const points = Array.isArray(body?.points)
    ? body.points.filter((value: unknown): value is string => typeof value === "string")
    : [];

  if (!equipmentTypeId || points.length === 0) {
    return NextResponse.json(
      { error: "Invalid payload. Expected: { equipmentTypeId: string, points: string[] }" },
      { status: 400 },
    );
  }

  const resources = await getBasResources();
  const result = validatePointList(equipmentTypeId, points, resources.babel, resources.templates);

  return NextResponse.json(result);
}
