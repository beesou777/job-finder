/**
 * Simple in-memory rate limiter: 5 requests per day per IP.
 * For serverless, each instance has its own store. For production at scale, use Redis (Upstash, Vercel KV).
 */

const store = new Map<string, number[]>();
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_REQUESTS = process.env.NODE_ENV === "production" ? 30 : 500;

function cleanup() {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) store.delete(key);
    else store.set(key, valid);
  }
}

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  // Allow unlimited/high searches for localhost or dev
  if (
    process.env.NODE_ENV !== "production" ||
    identifier === "127.0.0.1" ||
    identifier === "::1" ||
    identifier === "localhost" ||
    identifier === "unknown"
  ) {
    return { allowed: true, remaining: 500 };
  }

  cleanup();
  const now = Date.now();
  const timestamps = store.get(identifier) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  store.set(identifier, recent);
  return { allowed: true, remaining: MAX_REQUESTS - recent.length };
}

/** Retry-after seconds when rate limited (24h) */
export const RATE_LIMIT_RETRY_AFTER = Math.ceil(WINDOW_MS / 1000);

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  return "unknown";
}
