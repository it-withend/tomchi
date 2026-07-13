// Optional Supabase link for the bot. When SUPABASE_URL + SERVICE_ROLE key are
// set, the bot reads fields the farmer configured in the web app (linked by a
// pairing code). Uses the service role, which bypasses RLS.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { FieldConfig } from '../src/engine/irrigation';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supa: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export const supaEnabled = !!supa;

function rowToField(r: any): FieldConfig {
  return {
    id: r.client_id,
    regionId: r.region_id,
    cropId: r.crop_id,
    areaHa: Number(r.area_ha),
    method: r.method,
    soil: r.soil,
    lastWatered: r.last_watered ?? undefined,
  };
}

/** Consume a pairing code and link this chat to its owner. Returns success. */
export async function linkChat(code: string, chatId: number, lang: string): Promise<boolean> {
  if (!supa) return false;
  const { data: pc } = await supa
    .from('pair_codes')
    .select('owner, expires_at')
    .eq('code', code)
    .maybeSingle();
  if (!pc || new Date(pc.expires_at).getTime() < Date.now()) return false;

  const { error } = await supa
    .from('bot_links')
    .upsert({ chat_id: chatId, owner: pc.owner, lang, subscribed: true });
  if (error) { console.error('linkChat:', error.message); return false; }

  await supa.from('pair_codes').delete().eq('code', code);
  return true;
}

export async function isLinked(chatId: number): Promise<boolean> {
  if (!supa) return false;
  const { data } = await supa.from('bot_links').select('chat_id').eq('chat_id', chatId).maybeSingle();
  return !!data;
}

export async function fieldsForChat(chatId: number): Promise<FieldConfig[]> {
  if (!supa) return [];
  const { data: link } = await supa.from('bot_links').select('owner').eq('chat_id', chatId).maybeSingle();
  if (!link) return [];
  const { data: rows } = await supa.from('fields').select('*').eq('owner', link.owner);
  return (rows ?? []).map(rowToField);
}

export type WEvent = { fieldId: string; type: 'watered' | 'rain'; at: string };

/** Recent watering events (newest first) for the chat's linked owner. */
export async function eventsForChat(chatId: number, limit = 12): Promise<WEvent[]> {
  if (!supa) return [];
  const { data: link } = await supa.from('bot_links').select('owner').eq('chat_id', chatId).maybeSingle();
  if (!link) return [];
  const { data: rows } = await supa
    .from('watering_events')
    .select('client_field_id, type, at')
    .eq('owner', link.owner)
    .order('at', { ascending: false })
    .limit(limit);
  return (rows ?? []).map((r: any) => ({ fieldId: r.client_field_id, type: r.type, at: r.at }));
}

export async function setSubscribed(chatId: number, subscribed: boolean): Promise<void> {
  if (!supa) return;
  await supa.from('bot_links').update({ subscribed }).eq('chat_id', chatId);
}

/** All subscribed linked chats with their fields, for the daily job. */
export async function subscribedChats(): Promise<{ chatId: number; lang: string; fields: FieldConfig[] }[]> {
  if (!supa) return [];
  const { data: links } = await supa.from('bot_links').select('chat_id, owner, lang').eq('subscribed', true);
  const out: { chatId: number; lang: string; fields: FieldConfig[] }[] = [];
  for (const l of links ?? []) {
    const { data: rows } = await supa.from('fields').select('*').eq('owner', l.owner);
    out.push({ chatId: l.chat_id, lang: l.lang, fields: (rows ?? []).map(rowToField) });
  }
  return out;
}
