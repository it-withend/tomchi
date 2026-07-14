// Transport-agnostic bot logic. Both the local long-polling entry (bot.ts) and
// the Netlify webhook function feed updates into handleUpdate(); the daily
// reminder is exposed as sendDailyReminders(). All state lives in Supabase.
import { sendMessage, editMessage, answerCallback, type InlineButton } from './telegram';
import { getSub, upsertSub, allSubscribed, type Subscriber, type Lang, type Method, type Soil } from './subscribers';
import { m, stageName, methodName, soilName, monthShort } from './messages';
import { regions } from '../src/data/regions';
import { crops, type Crop } from '../src/data/crops';
import { dayStatus, getCrop, getRegion, seasonCalendar, seasonTotals, stageAt, daysIntoSeason, SOM_PER_M3, type FieldConfig } from '../src/engine/irrigation';
import { supaEnabled, linkChat, isLinked, linkedLang, fieldsForChat, subscribedChats, setSubscribed, eventsForChat } from './supa';

const WEBSITE = process.env.TOMCHI_SITE_URL || 'https://tomchiai.netlify.app';

// ---- helpers ----------------------------------------------------------------

/** If a field entered a new growth stage today, an alert with that stage's
 *  fertilisation tip; otherwise null. Stateless — fires on the transition day. */
function stageAlert(field: FieldConfig, lang: Lang): string | null {
  const crop = getCrop(field.cropId);
  const today = new Date();
  const dIn = daysIntoSeason(crop, today);
  if (dIn < 0) return null;
  const yst = new Date(today);
  yst.setDate(today.getDate() - 1);
  const dPrev = daysIntoSeason(crop, yst);
  const stageToday = stageAt(crop, dIn).key;
  const stagePrev = dPrev >= 0 ? stageAt(crop, dPrev).key : null;
  if (stageToday === stagePrev) return null; // no change today
  const parts = [m('stageChanged', lang, { crop: crop.name[lang], stage: stageName[stageToday]?.[lang] ?? stageToday })];
  const fert = crop.fertilizer.find((f) => f.stage === stageToday);
  if (fert) parts.push(m('fertilizerNow', lang, { text: fert.text[lang] }));
  return parts.join('\n');
}

function fieldLabel(f: FieldConfig, lang: Lang): string {
  const crop = getCrop(f.cropId);
  const region = getRegion(f.regionId);
  return `${crop.emoji} ${crop.name[lang]} · ${f.areaHa} ${lang === 'uz' ? 'ga' : 'га'} (${region.name[lang]})`;
}

function grid(buttons: InlineButton[], cols = 2): InlineButton[][] {
  const rows: InlineButton[][] = [];
  for (let i = 0; i < buttons.length; i += cols) rows.push(buttons.slice(i, i + cols));
  return rows;
}

function toField(s: Subscriber): FieldConfig {
  return {
    id: String(s.chatId),
    regionId: s.regionId!,
    cropId: s.cropId!,
    areaHa: s.areaHa,
    method: s.method!,
    soil: s.soil!,
    lastWatered: s.lastWatered,
  };
}

// Open-Meteo forecast checks for the next 3 days (bot-side, no localStorage).
// One fetch per region per run — many chats share a region, so promises are memoised.
export interface WeatherWarn { rain: boolean; frost: boolean; heat: boolean; wind: boolean }
const NO_WARN: WeatherWarn = { rain: false, frost: false, heat: false, wind: false };
const warnCache = new Map<string, Promise<WeatherWarn>>();

function weatherWarn(regionId: string): Promise<WeatherWarn> {
  const cached = warnCache.get(regionId);
  if (cached) return cached;
  const p = (async (): Promise<WeatherWarn> => {
    const r = regions.find((x) => x.id === regionId);
    if (!r) return NO_WARN;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lon}` +
        `&daily=precipitation_sum,temperature_2m_min,temperature_2m_max,wind_speed_10m_max&forecast_days=3&timezone=auto`;
      const res = await fetch(url);
      const j = await res.json();
      const d = j.daily ?? {};
      return {
        rain: (d.precipitation_sum ?? []).some((mm: number) => mm >= 5),
        // Frost bites overnight — check the next two nights.
        frost: (d.temperature_2m_min ?? []).slice(0, 2).some((t: number) => t <= 1),
        heat: (d.temperature_2m_max ?? []).some((t: number) => t >= 39),
        wind: (d.wind_speed_10m_max ?? []).some((v: number) => v >= 40), // km/h
      };
    } catch {
      return NO_WARN;
    }
  })();
  warnCache.set(regionId, p);
  // Memoise only within one invocation burst; expire quickly so the daily cron
  // (warm container) doesn't reuse yesterday's forecast.
  setTimeout(() => warnCache.delete(regionId), 5 * 60 * 1000);
  return p;
}

/** Weather warning lines (frost/heat/wind) for the day's message. */
function warnLines(warn: WeatherWarn, lang: Lang): string[] {
  const out: string[] = [];
  if (warn.frost) out.push(m('frostAlert', lang));
  if (warn.heat) out.push(m('heatAlert', lang));
  if (warn.wind) out.push(m('windAlert', lang));
  return out;
}

function fieldBlock(field: FieldConfig, lang: Lang, withHeader: boolean): string | null {
  const st = dayStatus(field);
  const crop: Crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);
  const header = withHeader
    ? m('fieldHeader', lang, { crop: crop.name[lang], area: field.areaHa, region: region.name[lang] })
    : null;
  if (!st.inSeason) {
    return [header, m('offSeason', lang)].filter(Boolean).join('\n');
  }
  const m3 = Math.round(st.litersPerDay / 100) / 10;
  const lines: string[] = [];
  if (header) lines.push(header);
  lines.push(
    m('waterLine', lang, { v: m3, mm: Math.round(st.grossMm * 10) / 10 }),
    m('stageLine', lang, { s: stageName[st.stage]?.[lang] ?? st.stage }),
    m('intervalLine', lang, { n: st.intervalDays }),
  );
  return lines.join('\n');
}

function dailyMessage(fields: FieldConfig[], lang: Lang, warn: WeatherWarn): string | null {
  if (!fields.length) return null;
  const alerts = [...warnLines(warn, lang), ...(fields.map((f) => stageAlert(f, lang)).filter(Boolean) as string[])];
  const blocks = fields.map((f) => fieldBlock(f, lang, fields.length > 1)).filter(Boolean) as string[];
  const out: string[] = [];
  if (alerts.length) out.push(alerts.join('\n\n'), '');
  out.push(m('dailyHeader', lang), '', blocks.join('\n\n'));
  if (warn.rain) out.push('\n' + m('rainSkip', lang));
  return out.join('\n');
}

/** One field's block with its header (for the per-field detail view). */
function singleFieldMessage(f: FieldConfig, lang: Lang, warn: WeatherWarn): string {
  const stage = stageAlert(f, lang);
  const alerts = [...warnLines(warn, lang), ...(stage ? [stage] : [])];
  const out: string[] = [];
  if (alerts.length) out.push(alerts.join('\n\n'), '');
  out.push(fieldBlock(f, lang, true) ?? '');
  if (warn.rain) out.push('\n' + m('rainSkip', lang));
  return out.join('\n');
}

function calendarText(fields: FieldConfig[], lang: Lang): string {
  const parts: string[] = [m('calendarHeader', lang)];
  for (const f of fields) {
    const crop = getCrop(f.cropId);
    const region = getRegion(f.regionId);
    const cal = seasonCalendar(f);
    const rows = cal
      .filter((r) => r.m3Field > 0)
      .map((r) => `${monthShort[lang][r.month]}: ${Math.round(r.m3Field)} m³`)
      .join('\n');
    const total = cal.reduce((s, r) => s + r.m3Field, 0);
    parts.push(
      `\n${m('fieldHeader', lang, { crop: crop.name[lang], area: f.areaHa, region: region.name[lang] })}\n${rows || '—'}\n${m('calendarTotal', lang, { v: Math.round(total) })}`,
    );
  }
  return parts.join('\n');
}

function savingsText(fields: FieldConfig[], lang: Lang): string {
  const parts: string[] = [m('savingsHeader', lang)];
  for (const f of fields) {
    const crop = getCrop(f.cropId);
    const tot = seasonTotals(f);
    const method = m(f.method, lang);
    const block = [`\n${crop.emoji} <b>${crop.name[lang]}</b>`];
    block.push(m('savingsWater', lang, { v: Math.round(tot.m3Saved), method }));
    block.push(m('savingsMoney', lang, { v: Math.round(tot.m3Saved * SOM_PER_M3) }));
    if (f.method === 'drip') block.push(m('savingsBest', lang));
    parts.push(block.join('\n'));
  }
  return parts.join('\n');
}

function fmtDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  return `${d.getDate()} ${monthShort[lang][d.getMonth()]} ${d.getFullYear()}`;
}

/** Reply language: user's in-bot choice, else the language from the app link. */
async function resolveLang(chatId: number, sub?: Subscriber): Promise<Lang> {
  if (sub?.lang) return sub.lang;
  const l = await linkedLang(chatId);
  return l === 'ru' ? 'ru' : 'uz';
}

/** Resolve the fields for a chat: linked app fields take priority. */
async function resolveFields(chatId: number, sub?: Subscriber): Promise<FieldConfig[]> {
  if (await isLinked(chatId)) return fieldsForChat(chatId);
  if (sub && sub.step === 'done') return [toField(sub)];
  return [];
}

// ---- setup keyboards --------------------------------------------------------

const langKb: InlineButton[][] = [[
  { text: "🇺🇿 O'zbekcha", callback_data: 'lang:uz' },
  { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
]];

function regionKb(lang: Lang) {
  return grid(regions.map((r) => ({ text: r.name[lang], callback_data: `region:${r.id}` })), 2);
}
function cropKb(lang: Lang) {
  return grid(crops.map((c) => ({ text: `${c.emoji} ${c.name[lang]}`, callback_data: `crop:${c.id}` })), 2);
}
function methodKb(lang: Lang) {
  return grid((['furrow', 'sprinkler', 'drip'] as const).map((k) => ({ text: methodName[k][lang], callback_data: `method:${k}` })), 1);
}
function soilKb(lang: Lang) {
  return grid((['sandy', 'loam', 'clay'] as const).map((k) => ({ text: soilName[k][lang], callback_data: `soil:${k}` })), 1);
}

function menuKb(lang: Lang): InlineButton[][] {
  return [
    [
      { text: lang === 'uz' ? '💧 Bugun' : '💧 Сегодня', callback_data: 'cmd:today' },
      { text: lang === 'uz' ? '📅 Taqvim' : '📅 Календарь', callback_data: 'cmd:calendar' },
    ],
    [
      { text: lang === 'uz' ? '🌊 Tejamkorlik' : '🌊 Экономия', callback_data: 'cmd:savings' },
      { text: lang === 'uz' ? '📖 Tarix' : '📖 История', callback_data: 'cmd:history' },
    ],
    [{ text: m('myFields', lang), callback_data: 'cmd:fields' }],
  ];
}

async function replyToday(chatId: number, lang: Lang, sub?: Subscriber) {
  const fields = await resolveFields(chatId, sub);
  if (!fields.length) { await sendMessage(chatId, m('noFields', lang)); return; }
  const warn = await weatherWarn(fields[0].regionId);
  await sendMessage(chatId, dailyMessage(fields, lang, warn) ?? m('noFields', lang), menuKb(lang));
}
async function replyCalendar(chatId: number, lang: Lang, sub?: Subscriber) {
  const fields = await resolveFields(chatId, sub);
  if (!fields.length) { await sendMessage(chatId, m('noFields', lang)); return; }
  await sendMessage(chatId, calendarText(fields, lang), menuKb(lang));
}
async function replySavings(chatId: number, lang: Lang, sub?: Subscriber) {
  const fields = await resolveFields(chatId, sub);
  if (!fields.length) { await sendMessage(chatId, m('noFields', lang)); return; }
  await sendMessage(chatId, savingsText(fields, lang), menuKb(lang));
}
async function replyHistory(chatId: number, lang: Lang) {
  const events = await eventsForChat(chatId, 12);
  if (!events.length) { await sendMessage(chatId, m('historyEmpty', lang), menuKb(lang)); return; }
  const lines = events.map((e) =>
    m(e.type === 'rain' ? 'historyRain' : 'historyWatered', lang, { date: fmtDate(e.at, lang) }),
  );
  const text = [m('historyHeader', lang, { n: events.length }), '', ...lines].join('\n');
  await sendMessage(chatId, text, menuKb(lang));
}

/** List the chat's fields as buttons so the farmer can pick one to view. */
async function replyFields(chatId: number, lang: Lang, sub?: Subscriber) {
  const fields = await resolveFields(chatId, sub);
  if (!fields.length) { await sendMessage(chatId, m('noFields', lang)); return; }
  if (fields.length === 1) { await replyFieldDetail(chatId, lang, fields[0].id, sub); return; }
  const kb = fields.map((f) => [{ text: fieldLabel(f, lang), callback_data: `fld:${f.id}` }]);
  await sendMessage(chatId, m('fieldsHeader', lang, { n: fields.length }), kb);
}

/** One field: today + a per-field menu (calendar / savings) and a back button. */
async function replyFieldDetail(chatId: number, lang: Lang, fieldId: string, sub?: Subscriber) {
  const fields = await resolveFields(chatId, sub);
  const f = fields.find((x) => x.id === fieldId) ?? fields[0];
  if (!f) { await sendMessage(chatId, m('noFields', lang)); return; }
  const warn = await weatherWarn(f.regionId);
  const kb: InlineButton[][] = [
    [
      { text: lang === 'uz' ? '📅 Taqvim' : '📅 Календарь', callback_data: `fc:${f.id}` },
      { text: lang === 'uz' ? '🌊 Tejamkorlik' : '🌊 Экономия', callback_data: `fs:${f.id}` },
    ],
    ...(fields.length > 1 ? [[{ text: m('backFields', lang), callback_data: 'cmd:fields' }]] : []),
  ];
  await sendMessage(chatId, singleFieldMessage(f, lang, warn), kb);
}

async function replyFieldView(chatId: number, lang: Lang, fieldId: string, view: 'cal' | 'sav', sub?: Subscriber) {
  const fields = await resolveFields(chatId, sub);
  const f = fields.find((x) => x.id === fieldId);
  if (!f) { await sendMessage(chatId, m('noFields', lang)); return; }
  const back: InlineButton[][] = [[{ text: m('backFields', lang), callback_data: `fld:${f.id}` }]];
  await sendMessage(chatId, view === 'cal' ? calendarText([f], lang) : savingsText([f], lang), back);
}

// ---- update handling --------------------------------------------------------

async function onMessage(msg: any) {
  const chatId = msg.chat.id;
  const text: string = msg.text ?? '';
  const sub = await getSub(chatId);
  const lang: Lang = await resolveLang(chatId, sub);

  if (text.startsWith('/start')) {
    const linked = (await isLinked(chatId)) || sub?.step === 'done';
    const openBtn: InlineButton[] = [{ text: m('openApp', lang), url: WEBSITE }];
    if (linked) {
      await sendMessage(chatId, m('welcome', lang) + m('siteLine', lang, { url: WEBSITE }),
        [openBtn, [{ text: m('myFields', lang), callback_data: 'cmd:fields' }]]);
      await replyFields(chatId, lang, sub);
    } else {
      await upsertSub(chatId, { step: 'lang' });
      await sendMessage(chatId, m('welcome', lang) + m('siteLine', lang, { url: WEBSITE }) + (supaEnabled ? m('linkHint', lang) : ''),
        [openBtn, ...langKb]);
    }
    return;
  }
  if (text.startsWith('/help')) { await sendMessage(chatId, m('help', lang)); return; }
  if (text.startsWith('/link')) {
    const code = text.split(/\s+/)[1]?.trim();
    if (!code || !/^\d{6}$/.test(code)) { await sendMessage(chatId, m('linkUsage', lang)); return; }
    const ok = await linkChat(code, chatId, lang);
    if (ok) { await sendMessage(chatId, m('linkOkFields', lang)); await replyFields(chatId, lang, sub); }
    else await sendMessage(chatId, m('linkFail', lang));
    return;
  }
  if (text.startsWith('/fields') || text.startsWith('/dalalar')) { await replyFields(chatId, lang, sub); return; }
  if (text.startsWith('/stop')) {
    await upsertSub(chatId, { subscribed: false });
    await setSubscribed(chatId, false);
    await sendMessage(chatId, m('stopped', lang));
    return;
  }
  if (text.startsWith('/menu')) { await sendMessage(chatId, m('menu', lang), menuKb(lang)); return; }
  if (text.startsWith('/today')) { await replyToday(chatId, lang, sub); return; }
  if (text.startsWith('/calendar') || text.startsWith('/taqvim')) { await replyCalendar(chatId, lang, sub); return; }
  if (text.startsWith('/savings') || text.startsWith('/tejamkorlik')) { await replySavings(chatId, lang, sub); return; }
  if (text.startsWith('/history') || text.startsWith('/tarix')) { await replyHistory(chatId, lang); return; }
  await sendMessage(chatId, m('help', lang));
}

async function onCallback(cb: any) {
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;
  const [act, value] = (cb.data as string).split(':');
  await answerCallback(cb.id);
  const sub = await getSub(chatId);
  const lang: Lang = await resolveLang(chatId, sub);

  switch (act) {
    case 'lang': {
      const l = value as Lang;
      await upsertSub(chatId, { lang: l, step: 'region' });
      await editMessage(chatId, messageId, m('askRegion', l), regionKb(l));
      break;
    }
    case 'region': {
      await upsertSub(chatId, { regionId: value, step: 'crop' });
      await editMessage(chatId, messageId, m('askCrop', lang), cropKb(lang));
      break;
    }
    case 'crop': {
      await upsertSub(chatId, { cropId: value, step: 'method' });
      await editMessage(chatId, messageId, m('askMethod', lang), methodKb(lang));
      break;
    }
    case 'method': {
      await upsertSub(chatId, { method: value as Method, step: 'soil' });
      await editMessage(chatId, messageId, m('askSoil', lang), soilKb(lang));
      break;
    }
    case 'soil': {
      const done = await upsertSub(chatId, { soil: value as Soil, step: 'done', subscribed: true });
      await editMessage(chatId, messageId, m('done', lang));
      await replyToday(chatId, lang, done);
      break;
    }
    case 'cmd': {
      if (value === 'today') await replyToday(chatId, lang, sub);
      else if (value === 'calendar') await replyCalendar(chatId, lang, sub);
      else if (value === 'savings') await replySavings(chatId, lang, sub);
      else if (value === 'history') await replyHistory(chatId, lang);
      else if (value === 'fields') await replyFields(chatId, lang, sub);
      break;
    }
    case 'fld': await replyFieldDetail(chatId, lang, value, sub); break;
    case 'fc': await replyFieldView(chatId, lang, value, 'cal', sub); break;
    case 'fs': await replyFieldView(chatId, lang, value, 'sav', sub); break;
  }
}

/** Single entry point for one Telegram update (message or callback). */
export async function handleUpdate(u: any): Promise<void> {
  try {
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await onCallback(u.callback_query);
  } catch (e) {
    console.error('handleUpdate error:', e);
  }
}

// ---- daily reminder ---------------------------------------------------------

export async function sendDailyReminders(): Promise<void> {
  const linkedChatIds = new Set<number>();

  // 1) Fields configured in the web app and linked via a pairing code.
  const linked = await subscribedChats();
  for (const c of linked) {
    linkedChatIds.add(c.chatId);
    const warn = c.fields[0] ? await weatherWarn(c.fields[0].regionId) : NO_WARN;
    const t = dailyMessage(c.fields, c.lang as Lang, warn);
    if (t) await sendMessage(c.chatId, t);
  }

  // 2) Chats that set up directly in the bot (and aren't already linked).
  const subs = (await allSubscribed()).filter((s) => !linkedChatIds.has(s.chatId));
  for (const s of subs) {
    const warn = await weatherWarn(s.regionId!);
    const t = dailyMessage([toField(s)], s.lang, warn);
    if (t) await sendMessage(s.chatId, t);
  }
  console.log(`Daily reminders sent: ${linked.length} linked + ${subs.length} local.`);
}
