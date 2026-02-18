import { NextRequest, NextResponse } from "next/server";
import {
  getBasResources,
  getNotModifiedResponseHeaders,
  isEtagMatch,
} from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const resources = await getBasResources();

  if (isEtagMatch(request.headers.get("if-none-match"), resources.etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: getNotModifiedResponseHeaders(resources.etag),
    });
  }

  return NextResponse.json(
    {
      ...resources.meta,
      source: {
        babel: "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json",
        atlas: "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/index.json",
      },
    },
    {
      headers: getNotModifiedResponseHeaders(resources.etag),
    },
  );
}
