import { chat, systemPrompt, TEXT_MODEL, cors } from './_ai.mjs';
import { rateLimit } from './_ratelimit.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  // Paid upstream call — cap how fast one caller can spend it.
  const limited = rateLimit(req, { perMinute: 8, cors });
  if (limited) return limited;
  try {
    const { cropId, symptoms, lang } = await req.json();
    if (!symptoms || typeof symptoms !== 'string') {
      return new Response(JSON.stringify({ error: 'symptoms required' }), { status: 400, headers: cors });
    }
    const answer = await chat(TEXT_MODEL, [
      { role: 'system', content: systemPrompt(cropId, lang) },
      { role: 'user', content: symptoms.slice(0, 1000) },
    ]);
    return new Response(JSON.stringify({ answer }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: cors });
  }
};
