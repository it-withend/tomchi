import { functionsUrl, anonKey, ensureSession, supabase } from './supabase';
import type { Lang } from '../i18n';

export const aiEnabled = !!functionsUrl;

async function authHeader(): Promise<Record<string, string>> {
  await ensureSession();
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  const token = data.session?.access_token ?? anonKey ?? '';
  return { Authorization: `Bearer ${token}`, apikey: anonKey ?? '' };
}

async function callFn(fn: string, body: unknown): Promise<string> {
  if (!functionsUrl) throw new Error('AI not configured');
  const res = await fetch(`${functionsUrl}/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const json = await res.json();
  return json.answer as string;
}

export function diagnoseText(cropId: string, symptoms: string, lang: Lang): Promise<string> {
  return callFn('diagnose', { cropId, symptoms, lang });
}

export function diagnosePhoto(cropId: string, imageBase64: string, lang: Lang): Promise<string> {
  return callFn('diagnose-photo', { cropId, image: imageBase64, lang });
}
