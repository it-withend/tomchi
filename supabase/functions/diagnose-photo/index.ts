// AI plant doctor (photo / vision). Deployed as a Supabase Edge Function (Deno).
// deno-lint-ignore-file no-explicit-any
import { cors } from '../_shared/cors.ts';
import { chat, systemPrompt, VISION_MODEL } from '../_shared/ai.ts';

declare const Deno: { serve: (h: (req: Request) => Promise<Response> | Response) => void };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { cropId, image, lang } = await req.json();
    if (!image || typeof image !== 'string') {
      return json({ error: 'image (base64) required' }, 400);
    }
    const dataUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const prompt =
      lang === 'ru'
        ? 'Осмотрите фото растения и поставьте диагноз по структуре из системной инструкции.'
        : 'Rasmni ko‘rib chiqing va tizim ko‘rsatmasidagi tuzilma bo‘yicha tashxis qo‘ying.';

    const answer = await chat(VISION_MODEL, [
      { role: 'system', content: systemPrompt(cropId ?? 'cotton', lang ?? 'uz') },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
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
