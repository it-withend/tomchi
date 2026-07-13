import type { Lang } from '../i18n';

const base = (import.meta.env.VITE_AI_URL as string | undefined) ?? '/.netlify/functions';

export interface ChatMsg { role: 'user' | 'assistant'; content: string }

export async function askAgronom(
  question: string,
  ctx: { cropId: string; regionName: string; stage?: string; lang: Lang },
  history: ChatMsg[],
): Promise<string> {
  const res = await fetch(`${base}/agronom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, ...ctx, history }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.answer as string;
}
