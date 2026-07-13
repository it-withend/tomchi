import { chat, systemPrompt, VISION_MODEL, cors } from './_ai.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { cropId, image, lang } = await req.json();
    if (!image || typeof image !== 'string') {
      return new Response(JSON.stringify({ error: 'image (base64) required' }), { status: 400, headers: cors });
    }
    const dataUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const prompt = lang === 'ru'
      ? 'Осмотрите фото растения и поставьте диагноз по структуре из системной инструкции.'
      : 'Rasmni ko‘rib chiqing va tizim ko‘rsatmasidagi tuzilma bo‘yicha tashxis qo‘ying.';
    const answer = await chat(VISION_MODEL, [
      { role: 'system', content: systemPrompt(cropId, lang) },
      { role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } },
      ] },
    ]);
    return new Response(JSON.stringify({ answer }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: cors });
  }
};
