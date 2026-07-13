// Conversational AI agronomist. Answers any farming question, personalised to
// the farmer's field (crop, region, growth stage). Uses the same Groq backend
// as the disease doctor, with a broader agronomy system prompt + short history.
import { chat, TEXT_MODEL, cors } from './_ai.mjs';

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { question, cropId, regionName, stage, lang, history } = await req.json();
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'question required' }), { status: 400, headers: cors });
    }
    const language = lang === 'ru' ? 'Russian' : 'Uzbek (Latin script)';
    const system = `You are an experienced agronomist advising smallholder farmers in Uzbekistan (Central Asian irrigated agriculture, hot arid climate).
Field context: crop = ${cropId || 'unspecified'}, region = ${regionName || 'Uzbekistan'}${stage ? `, current growth stage = ${stage}` : ''}.
Answer ONLY in ${language}. Be concrete and practical: irrigation, fertilizing, pests and diseases, planting, harvest, storage, and selling. Prefer short numbered steps. Name affordable inputs available in Uzbekistan. Keep answers under 170 words.
If you are unsure, say so briefly and suggest confirming with a local agronomist. If the question is not about farming, gently steer back to the farm.`;

    const prior = Array.isArray(history)
      ? history
          .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
          .slice(-6)
          .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 800) }))
      : [];

    const messages = [
      { role: 'system', content: system },
      ...prior,
      { role: 'user', content: question.slice(0, 1000) },
    ];
    const answer = await chat(TEXT_MODEL, messages);
    return new Response(JSON.stringify({ answer }), { headers: cors });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: cors });
  }
};
