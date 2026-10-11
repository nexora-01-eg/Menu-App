interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 20_000; // crude memory cap for a long-lived instance

/**
 * Fixed-window rate limiter. Returns true if the request should be
 * allowed, false if the caller has exceeded `limit` requests within
 * `windowMs`.
 *
 * ⚠️ Known limitation: this state lives in the Node process memory,
 * so it resets on redeploy and is NOT shared across multiple
 * serverless instances/regions. It stops a single client hammering a
 * single instance, but is not a substitute for a real distributed
 * limiter (Upstash Ratelimit, Redis) in front of a multi-region
 * Vercel deployment — see the Launch Report.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > MAX_BUCKETS) buckets.clear();
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Best-effort client identifier from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
