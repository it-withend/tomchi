// AI plant doctor (text). Deployed as a Supabase Edge Function (Deno).
// deno-lint-ignore-file no-explicit-any
import { cors } from '../_shared/cors.ts';
import { chat, systemPrompt, TEXT_MODEL } from '../_shared/ai.ts';

declare const Deno: { serve: (h: (req: Request) => Promise<Response> | Response) => void };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { cropId, symptoms, lang } = await req.json();
    if (!symptoms || typeof symptoms !== 'string') {
      return json({ error: 'symptoms required' }, 400);
    }
    const answer = await chat(TEXT_MODEL, [
      { role: 'system', content: systemPrompt(cropId ?? 'cotton', lang ?? 'uz') },
      { role: 'user', content: symptoms.slice(0, 1000) },
    ]);
    return json({ answer });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(body: any, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
