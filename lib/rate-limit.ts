import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = { success: boolean; limit: number; remaining: number; reset: number };

// Singleton limiter — created once, reused across requests
let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    // 5 requests per 10 minutes per identifier
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "basidekick:rl",
  });

  return limiter;
}

/**
 * Rate-limit a request by a unique identifier (e.g. user ID or IP).
 * Degrades gracefully when Upstash is not configured (local dev / CI).
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const l = getLimiter();
  if (!l) {
    return { success: true, limit: 5, remaining: 5, reset: 0 };
  }
  return l.limit(identifier);
}
