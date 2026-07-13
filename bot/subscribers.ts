// In-bot setup state, persisted in Supabase so it survives on serverless
// (Netlify webhook has no local disk). Falls back to an in-memory map when
// Supabase isn't configured, so local polling still works without a backend.
import { supa } from './supa';

export type Lang = 'uz' | 'ru';
export type Method = 'furrow' | 'sprinkler' | 'drip';
export type Soil = 'sandy' | 'loam' | 'clay';

export interface Subscriber {
  chatId: number;
  lang: Lang;
  step: 'lang' | 'region' | 'crop' | 'method' | 'soil' | 'done';
  regionId?: string;
  cropId?: string;
  method?: Method;
  soil?: Soil;
  areaHa: number;
  lastWatered?: string;
  subscribed: boolean;
}

const mem = new Map<number, Subscriber>();

function fresh(chatId: number): Subscriber {
  return { chatId, lang: 'uz', step: 'lang', areaHa: 1, subscribed: false };
}

function rowToSub(r: any): Subscriber {
  return {
    chatId: Number(r.chat_id),
    lang: (r.lang ?? 'uz') as Lang,
    step: r.step ?? 'lang',
    regionId: r.region_id ?? undefined,
    cropId: r.crop_id ?? undefined,
    method: (r.method ?? undefined) as Method | undefined,
    soil: (r.soil ?? undefined) as Soil | undefined,
    areaHa: r.area_ha != null ? Number(r.area_ha) : 1,
    lastWatered: r.last_watered ?? undefined,
    subscribed: !!r.subscribed,
  };
}

function subToRow(s: Subscriber) {
  return {
    chat_id: s.chatId,
    lang: s.lang,
    step: s.step,
    region_id: s.regionId ?? null,
    crop_id: s.cropId ?? null,
    method: s.method ?? null,
    soil: s.soil ?? null,
    area_ha: s.areaHa,
    last_watered: s.lastWatered ?? null,
    subscribed: s.subscribed,
    updated_at: new Date().toISOString(),
  };
}

export async function getSub(chatId: number): Promise<Subscriber | undefined> {
  if (!supa) return mem.get(chatId);
  const { data } = await supa.from('bot_subscribers').select('*').eq('chat_id', chatId).maybeSingle();
  return data ? rowToSub(data) : undefined;
}

export async function upsertSub(chatId: number, patch: Partial<Subscriber>): Promise<Subscriber> {
  const cur = (await getSub(chatId)) ?? fresh(chatId);
  const next: Subscriber = { ...cur, ...patch, chatId };
  if (!supa) { mem.set(chatId, next); return next; }
  await supa.from('bot_subscribers').upsert(subToRow(next), { onConflict: 'chat_id' });
  return next;
}

/** All subscribers who set up directly in the bot and want daily reminders. */
export async function allSubscribed(): Promise<Subscriber[]> {
  if (!supa) return [...mem.values()].filter((s) => s.subscribed && s.step === 'done');
  const { data } = await supa
    .from('bot_subscribers')
    .select('*')
    .eq('subscribed', true)
    .eq('step', 'done');
  return (data ?? []).map(rowToSub);
}
