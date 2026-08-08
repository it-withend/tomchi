import { t, type Lang } from '../i18n';

// AI doctor calls Netlify Functions (key stays server-side). Override the base
// with VITE_AI_URL if you host the functions elsewhere.
const base = (import.meta.env.VITE_AI_URL as string | undefined) ?? '/.netlify/functions';

// Always show the AI tab; if functions aren't deployed yet the call surfaces a
// friendly error rather than a "not configured" dead end.
export const aiEnabled = true;

/** The server caps how often one caller may spend the paid AI quota. */
const RATE_LIMITED = 429;

async function callFn(fn: string, body: unknown, lang: Lang): Promise<string> {
  const res = await fetch(`${base}/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === RATE_LIMITED) throw new Error(t('aiTooFast', lang));
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.answer as string;
}

/** Voice → text: sends a recorded audio clip to Whisper, returns the transcript. */
export async function transcribe(audio: Blob, lang: Lang): Promise<string> {
  const res = await fetch(`${base}/transcribe?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': audio.type || 'audio/webm' },
    body: audio,
  });
  if (res.status === RATE_LIMITED) throw new Error(t('aiTooFast', lang));
  if (!res.ok) throw new Error(`STT error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return (json.text as string) || '';
}

export interface ChatMsg { role: 'user' | 'assistant'; text: string; image?: string }

/** Conversational agronomist: sends recent history + optional photo, gets a reply. */
export function chatAsk(cropId: string, messages: ChatMsg[], lang: Lang, image?: string): Promise<string> {
  return callFn('chat', { cropId, lang, messages: messages.map((m) => ({ role: m.role, text: m.text })), image }, lang);
}
