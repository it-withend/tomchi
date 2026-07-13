import 'dotenv/config';
import cron from 'node-cron';
import { getMe, sendMessage, editMessage, answerCallback, poll, type InlineButton } from './telegram';
import * as store from './store';
import { m, stageName, methodName, soilName } from './messages';
import { regions } from '../src/data/regions';
import { crops } from '../src/data/crops';
import { dayStatus, type FieldConfig } from '../src/engine/irrigation';

type Lang = store.Lang;

// ---- helpers ----------------------------------------------------------------

function grid(buttons: InlineButton[], cols = 2): InlineButton[][] {
  const rows: InlineButton[][] = [];
  for (let i = 0; i < buttons.length; i += cols) rows.push(buttons.slice(i, i + cols));
  return rows;
}

function toField(s: store.Subscriber): FieldConfig {
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

// Open-Meteo rain check for the next 3 days (bot-side, no localStorage).
async function rainSoon(regionId: string): Promise<boolean> {
  const r = regions.find((x) => x.id === regionId);
  if (!r) return false;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lon}&daily=precipitation_sum&forecast_days=3&timezone=auto`;
    const res = await fetch(url);
    const j = await res.json();
    return (j.daily?.precipitation_sum ?? []).some((mm: number) => mm >= 5);
  } catch {
    return false;
  }
}

function dailyText(s: store.Subscriber, lang: Lang, rain: boolean): string | null {
  const st = dayStatus(toField(s));
  if (!st.inSeason) return null;
  const m3 = Math.round(st.litersPerDay / 100) / 10;
  const lines = [
    m('dailyHeader', lang),
    m('waterLine', lang, { v: m3, mm: Math.round(st.grossMm * 10) / 10 }),
    m('stageLine', lang, { s: stageName[st.stage]?.[lang] ?? st.stage }),
    m('intervalLine', lang, { n: st.intervalDays }),
  ];
  if (rain) lines.push('\n' + m('rainSkip', lang));
  return lines.join('\n');
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

// ---- update handling --------------------------------------------------------

async function onMessage(msg: any) {
  const chatId = msg.chat.id;
  const text: string = msg.text ?? '';
  const sub = store.get(chatId);
  const lang: Lang = sub?.lang ?? 'uz';

  if (text.startsWith('/start')) {
    store.upsert(chatId, { step: 'lang' });
    await sendMessage(chatId, m('welcome', lang), langKb);
    return;
  }
  if (text.startsWith('/help')) {
    await sendMessage(chatId, m('help', lang));
    return;
  }
  if (text.startsWith('/stop')) {
    store.upsert(chatId, { subscribed: false });
    await sendMessage(chatId, m('stopped', lang));
    return;
  }
  if (text.startsWith('/today')) {
    if (!sub || sub.step !== 'done') { await sendMessage(chatId, m('needSetup', lang)); return; }
    const rain = await rainSoon(sub.regionId!);
    const t = dailyText(sub, lang, rain);
    await sendMessage(chatId, t ?? m('offSeason', lang));
    return;
  }
  // any other text
  await sendMessage(chatId, m('help', lang));
}

async function onCallback(cb: any) {
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;
  const [act, value] = (cb.data as string).split(':');
  await answerCallback(cb.id);
  const sub = store.get(chatId) ?? store.upsert(chatId, {});
  const lang: Lang = sub.lang;

  switch (act) {
    case 'lang': {
      const l = value as Lang;
      store.upsert(chatId, { lang: l, step: 'region' });
      await editMessage(chatId, messageId, m('askRegion', l), regionKb(l));
      break;
    }
    case 'region': {
      store.upsert(chatId, { regionId: value, step: 'crop' });
      await editMessage(chatId, messageId, m('askCrop', lang), cropKb(lang));
      break;
    }
    case 'crop': {
      store.upsert(chatId, { cropId: value, step: 'method' });
      await editMessage(chatId, messageId, m('askMethod', lang), methodKb(lang));
      break;
    }
    case 'method': {
      store.upsert(chatId, { method: value as store.Method, step: 'soil' });
      await editMessage(chatId, messageId, m('askSoil', lang), soilKb(lang));
      break;
    }
    case 'soil': {
      const done = store.upsert(chatId, { soil: value as store.Soil, step: 'done', subscribed: true });
      await editMessage(chatId, messageId, m('done', lang));
      const rain = await rainSoon(done.regionId!);
      const t = dailyText(done, lang, rain);
      if (t) await sendMessage(chatId, t);
      break;
    }
  }
}

// ---- daily reminder ---------------------------------------------------------

async function sendDailyReminders() {
  const subs = store.all().filter((s) => s.subscribed && s.step === 'done');
  console.log(`Sending daily reminders to ${subs.length} subscribers…`);
  for (const s of subs) {
    const rain = await rainSoon(s.regionId!);
    const t = dailyText(s, s.lang, rain);
    if (t) await sendMessage(s.chatId, t);
  }
}

// ---- boot -------------------------------------------------------------------

async function main() {
  store.load();
  const me = await getMe();
  console.log(`Tomchi bot @${me?.username} is live.`);

  // Every day at 07:00 Asia/Tashkent
  cron.schedule('0 7 * * *', sendDailyReminders, { timezone: 'Asia/Tashkent' });

  await poll((u) => {
    if (u.message) onMessage(u.message);
    else if (u.callback_query) onCallback(u.callback_query);
  });
}

main();
