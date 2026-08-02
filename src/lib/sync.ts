import { supabase, ensureSession } from './supabase';
import { lastEventDate, type FieldConfig, type WateringType } from '../engine/irrigation';

// All functions are best-effort: they never throw and quietly no-op when the
// backend is not configured. The UI stays responsive on localStorage.

export async function pushField(f: FieldConfig): Promise<void> {
  const user = await ensureSession();
  if (!user || !supabase) return;
  const { error } = await supabase.from('fields').upsert(
    {
      owner: user.id,
      client_id: f.id,
      region_id: f.regionId,
      crop_id: f.cropId,
      area_ha: f.areaHa,
      method: f.method,
      soil: f.soil,
      last_watered: lastEventDate(f) ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner,client_id' },
  );
  if (error) console.warn('Tomchi sync (field):', error.message);
}

export async function pushEvent(fieldId: string, type: WateringType, at: string): Promise<void> {
  const user = await ensureSession();
  if (!user || !supabase) return;
  const { error } = await supabase
    .from('watering_events')
    .insert({ owner: user.id, client_field_id: fieldId, type, at });
  if (error) console.warn('Tomchi sync (event):', error.message);
}

export async function removeFieldRemote(fieldId: string): Promise<void> {
  const user = await ensureSession();
  if (!user || !supabase) return;
  await supabase.from('fields').delete().eq('owner', user.id).eq('client_id', fieldId);
}

export interface TelegramLink {
  chatId: number;
  lang: string;
}

/** The Telegram chat this device is linked to, or null when it isn't linked. */
export async function getTelegramLink(): Promise<TelegramLink | null> {
  const user = await ensureSession();
  if (!user || !supabase) return null;
  const { data, error } = await supabase
    .from('bot_links')
    .select('chat_id, lang')
    .eq('owner', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return { chatId: data.chat_id, lang: data.lang };
}

/** Drops the Telegram link so reminders stop. Returns whether it worked. */
export async function unlinkTelegram(): Promise<boolean> {
  const user = await ensureSession();
  if (!user || !supabase) return false;
  const { error } = await supabase.from('bot_links').delete().eq('owner', user.id);
  if (error) { console.warn('Tomchi unlink (telegram):', error.message); return false; }
  return true;
}

/** Creates a 6-digit code linking this device to a Telegram chat via the bot. */
export async function createPairCode(): Promise<string | null> {
  const user = await ensureSession();
  if (!user || !supabase) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error } = await supabase.from('pair_codes').insert({ code, owner: user.id, expires_at });
    if (!error) return code;
  }
  return null;
}
