import { chat, chatSystemPrompt, TEXT_MODEL, VISION_MODEL, cors } from './_ai.mjs';

// Conversational agronomist. Body: { cropId, lang, messages:[{role,text}], image? }.
// `image` (base64/data URL) attaches to the latest user turn and switches to the
// vision model. History is trimmed server-side to keep requests small.
export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { cropId, lang, messages, image } = await req.json();
    const hist = (Array.isArray(messages) ? messages : [])
      .filter((m) => m && (m.text || m.role === 'user'))
      .slice(-10)
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.text || '').slice(0, 1500) }));

    if (!hist.length && !image) {
      return new Response(JSON.stringify({ error: 'empty message' }), { status: 400, headers: cors });
    }

    let model = TEXT_MODEL;
    if (image && typeof image === 'string') {
      model = VISION_MODEL;
      const dataUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
      const last = hist[hist.length - 1] ?? { role: 'user', content: '' };
      const text = last.role === 'user' ? last.content : '';
      const visionTurn = {
        role: 'user',
        content: [
          { type: 'text', text: text || (lang === 'ru' ? 'Осмотрите фото растения и подскажите, что это и что делать.' : 'Rasmni ko‘rib, muammoni va yechimni ayting.') },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      };
      if (last.role === 'user') hist[hist.length - 1] = visionTurn;
      else hist.push(visionTurn);
    }

    const answer = await chat(model, [
      { role: 'system', content: chatSystemPrompt(cropId, lang) },
      ...hist,
    ]);
    return new Response(JSON.stringify({ answer }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: cors });
  }
};
