import { NextRequest, NextResponse } from "next/server";
import { getBasResources } from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { normalizePointName } from "@/lib/api/bas-logic";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, { max: 60 });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Invalid payload. Expected: { name: string }" }, { status: 400 });
  }

  const resources = await getBasResources();
  const result = normalizePointName(name, resources.babel);

  return NextResponse.json(result);
}
