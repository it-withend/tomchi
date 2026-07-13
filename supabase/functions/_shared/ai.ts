// Provider-agnostic chat call over the OpenAI-compatible API.
// Defaults to Groq (free tier). Swap provider by changing the env vars below.
//   AI_API_KEY        - required (e.g. Groq key from console.groq.com)
//   AI_BASE_URL       - default https://api.groq.com/openai/v1
//   AI_MODEL          - text model id
//   AI_VISION_MODEL   - vision-capable model id (for photo diagnosis)
// deno-lint-ignore-file no-explicit-any
declare const Deno: { env: { get(k: string): string | undefined } };

const BASE = Deno.env.get('AI_BASE_URL') ?? 'https://api.groq.com/openai/v1';
const KEY = Deno.env.get('AI_API_KEY') ?? '';
export const TEXT_MODEL = Deno.env.get('AI_MODEL') ?? 'llama-3.3-70b-versatile';
export const VISION_MODEL = Deno.env.get('AI_VISION_MODEL') ?? 'meta-llama/llama-4-scout-17b-16e-instruct';

const CROP_NAMES: Record<string, string> = {
  cotton: 'paxta / хлопчатник / cotton',
  wheat: "bug'doy / пшеница / wheat",
  tomato: 'pomidor / томаты / tomato',
  grapes: 'uzum / виноград / grapes',
  apple: 'olma / яблоня / apple',
  melon: 'qovun-tarvuz / дыни-арбузы / melon',
  potato: 'kartoshka / картофель / potato',
};

export function systemPrompt(cropId: string, lang: string): string {
  const crop = CROP_NAMES[cropId] ?? cropId;
  const language = lang === 'ru' ? 'Russian' : 'Uzbek (Latin script)';
  return `You are an experienced agronomist advising farmers in Uzbekistan (Central Asian climate, irrigated agriculture).
The farmer grows: ${crop}.
Answer ONLY in ${language}. Be concrete and practical for a smallholder farmer.
Structure your answer with short labeled sections:
1) Likely problem (disease/pest/deficiency)
2) What to do now — numbered steps, name affordable treatments available in Uzbekistan
3) Prevention
Keep it under 180 words. If a photo is unclear or symptoms are ambiguous, say what extra detail is needed. Do not invent certainty; add a short note to confirm with a local agronomist.`;
}

export async function chat(model: string, messages: any[]): Promise<string> {
  if (!KEY) throw new Error('AI_API_KEY not set');
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 700 }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI provider ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}
