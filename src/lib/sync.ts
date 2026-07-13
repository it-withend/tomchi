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
