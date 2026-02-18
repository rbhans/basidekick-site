import { NextRequest, NextResponse } from "next/server";
import {
  getBasResources,
  getNotModifiedResponseHeaders,
  isEtagMatch,
} from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { searchAtlas, searchBabel } from "@/lib/api/bas-logic";

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (!query) {
    return NextResponse.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  const resources = await getBasResources();

  if (isEtagMatch(request.headers.get("if-none-match"), resources.etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: getNotModifiedResponseHeaders(resources.etag),
    });
  }

  return NextResponse.json(
    {
      query,
      babel: searchBabel(resources.babel, query).slice(0, 25),
      atlas: searchAtlas(resources.atlas, query).slice(0, 25),
    },
    { headers: getNotModifiedResponseHeaders(resources.etag) },
  );
}
