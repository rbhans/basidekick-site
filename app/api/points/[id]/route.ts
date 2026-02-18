import { NextRequest, NextResponse } from "next/server";
import {
  getBasResources,
  getNotModifiedResponseHeaders,
  isEtagMatch,
} from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { relatedPoints, traverseGraph } from "@/lib/api/bas-logic";

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

  const point = resources.babel.points.find((entry) => entry.concept.id === id);
  if (!point) {
    return NextResponse.json({ error: "Point not found" }, { status: 404 });
  }

  const includeGraph = request.nextUrl.searchParams.get("includeGraph") === "true";
  const depth = Number(request.nextUrl.searchParams.get("depth") || "2");
  const rel = request.nextUrl.searchParams.get("rel");
  const relTypes = rel
    ? rel
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  const response = {
    point,
    graph: includeGraph
      ? {
          related: relatedPoints(resources.graph, point.concept.id, relTypes),
          traversal: traverseGraph(resources.graph, point.concept.id, { depth, relTypes }),
        }
      : undefined,
  };

  return NextResponse.json(response, { headers: getNotModifiedResponseHeaders(resources.etag) });
}
