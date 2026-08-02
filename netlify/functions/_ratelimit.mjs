// Per-IP sliding-window limiter for the AI endpoints.
//
// These functions spend real money on every call (Groq text, vision and Whisper),
// and their URLs are visible to anyone who opens devtools on the deployed site.
// Without a limiter a single loop can drain the whole quota — which matters most
// during a public demo, when the address is on screen.
//
// Scope, stated plainly: the counter lives in the function instance's memory, so
// it only holds while Netlify keeps that instance warm and it is not shared
// across regions. That covers what it is meant to cover — a client hammering the
// endpoint keeps landing on the same warm instance. It is not a defence against a
// distributed flood; for that the counter would have to live in Supabase, which
// would add a round trip to every request.

const WINDOW_MS = 60_000;

/** ip -> array of request timestamps inside the current window */
const hits = new Map();

export function clientIp(req) {
  const h = req.headers;
  return (
    h.get('x-nf-client-connection-ip') ||
    (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

/**
 * Returns null when the caller may proceed, or a ready-to-return 429 Response
 * when it may not.
 */
export function rateLimit(req, { perMinute, cors }) {
  const now = Date.now();
  const ip = clientIp(req);
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);

  // Keep the map from growing without bound on a long-lived warm instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (!times.some((at) => now - at < WINDOW_MS)) hits.delete(key);
    }
  }

  if (recent.length >= perMinute) {
    hits.set(ip, recent);
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000));
    return new Response(
      JSON.stringify({ error: 'rate_limited', retryAfter }),
      { status: 429, headers: { ...cors, 'Retry-After': String(retryAfter) } },
    );
  }

  recent.push(now);
  hits.set(ip, recent);
  return null;
}
