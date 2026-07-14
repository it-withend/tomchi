import type { Lang } from '../i18n';

// AI doctor calls Netlify Functions (key stays server-side). Override the base
// with VITE_AI_URL if you host the functions elsewhere.
const base = (import.meta.env.VITE_AI_URL as string | undefined) ?? '/.netlify/functions';

// Always show the AI tab; if functions aren't deployed yet the call surfaces a
// friendly error rather than a "not configured" dead end.
export const aiEnabled = true;

async function callFn(fn: string, body: unknown): Promise<string> {
  const res = await fetch(`${base}/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.answer as string;
}

export function diagnoseText(cropId: string, symptoms: string, lang: Lang): Promise<string> {
  return callFn('diagnose', { cropId, symptoms, lang });
}

export function diagnosePhoto(cropId: string, imageBase64: string, lang: Lang): Promise<string> {
  return callFn('diagnose-photo', { cropId, image: imageBase64, lang });
}

export interface ChatMsg { role: 'user' | 'assistant'; text: string; image?: string }

/** Conversational agronomist: sends recent history + optional photo, gets a reply. */
export function chatAsk(cropId: string, messages: ChatMsg[], lang: Lang, image?: string): Promise<string> {
  return callFn('chat', { cropId, lang, messages: messages.map((m) => ({ role: m.role, text: m.text })), image });
}
