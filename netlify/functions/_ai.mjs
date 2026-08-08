// Shared Groq (OpenAI-compatible) call for the Netlify AI functions.
// Configure in Netlify env: AI_API_KEY (required), optional AI_BASE_URL / AI_MODEL / AI_VISION_MODEL.
const BASE = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
export const TEXT_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
export const VISION_MODEL = process.env.AI_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

const CROP_NAMES = {
  cotton: 'paxta / хлопчатник / cotton',
  wheat: "bug'doy / пшеница / wheat",
  tomato: 'pomidor / томаты / tomato',
  grapes: 'uzum / виноград / grapes',
  apple: 'olma / яблоня / apple',
  melon: 'qovun-tarvuz / дыни-арбузы / melon',
  potato: 'kartoshka / картофель / potato',
};

// The agronomist behind the chat tab. Photos and follow-up questions go through
// the same conversation, so there is one prompt rather than a separate one-shot
// disease form.
export function chatSystemPrompt(cropId, lang) {
  const crop = CROP_NAMES[cropId] || cropId || 'a crop';
  const language = lang === 'ru' ? 'Russian' : 'Uzbek (Latin script)';
  return `You are Tomchi's friendly, experienced agronomist for smallholder farmers in Uzbekistan (Central Asian irrigated agriculture).
The farmer mainly grows: ${crop}, but may ask about anything on their farm — irrigation, fertiliser, pests, diseases, planting, harvest, soil.
Answer ONLY in ${language}. Be warm, concrete and practical. Prefer short paragraphs or a few bullet points over long essays.
Name affordable inputs/treatments available in Uzbekistan when relevant. If a photo is unclear, say what extra detail would help.
Keep most answers under 130 words unless the farmer asks for detail. Don't invent certainty; suggest confirming with a local agronomist for serious cases.`;
}

export async function chat(model, messages) {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error('AI_API_KEY not set');
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 700 }),
  });
  if (!res.ok) throw new Error(`AI provider ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
