import { NextRequest, NextResponse } from "next/server";

type RateLimitBucket = {
  windowStart: number;
  count: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function applyRateLimit(
  request: NextRequest,
  options?: { max?: number; windowMs?: number },
): NextResponse | null {
  const max = options?.max ?? 120;
  const windowMs = options?.windowMs ?? 60_000;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(ip, { windowStart: now, count: 1 });
    return null;
  }

  if (bucket.count >= max) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((bucket.windowStart + windowMs - now) / 1000)),
        },
      },
    );
  }

  bucket.count += 1;
  buckets.set(ip, bucket);
  return null;
}
