import { NextRequest, NextResponse } from "next/server";
import {
  getBasResources,
  getNotModifiedResponseHeaders,
  isEtagMatch,
} from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { id } = await params;
  const resources = await getBasResources();

  if (isEtagMatch(request.headers.get("if-none-match"), resources.etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: getNotModifiedResponseHeaders(resources.etag),
    });
  }

  const equipment = resources.babel.equipment.find((entry) => entry.id === id);
  if (!equipment) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
  }

  return NextResponse.json({ equipment }, { headers: getNotModifiedResponseHeaders(resources.etag) });
}
