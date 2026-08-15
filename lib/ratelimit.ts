// ponytail: in-memory sliding window, per server instance. Good enough for a club
// site on a single Render dyno. Move to Redis/Upstash if this ever runs multi-instance.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Keep the map from growing forever when traffic is spread over many keys.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (now - times[times.length - 1] > windowMs) hits.delete(k);
    }
  }

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfter: 0 };
}

/** Caller IP, as seen behind Vercel/Render's proxy. */
export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: "Too many attempts. Slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
