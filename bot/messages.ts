import type { Lang } from './store';

type M = Record<string, { uz: string; ru: string }>;

export const M: M = {
  welcome: {
    uz: '🌱 <b>Tomchi</b> — aqlli sug‘orish yordamchisiga xush kelibsiz!\n\nMen dalangiz uchun har kuni qancha suv kerakligini hisoblab, sug‘orish vaqtini eslatib turaman.\n\nAvval tilni tanlang:',
    ru: '🌱 Добро пожаловать в <b>Tomchi</b> — умный помощник по поливу!\n\nЯ каждый день рассчитаю, сколько воды нужно вашему полю, и напомню о времени полива.\n\nСначала выберите язык:',
  },
  askRegion: { uz: '📍 Viloyatingizni tanlang:', ru: '📍 Выберите ваш регион:' },
  askCrop: { uz: '🌾 Ekiningizni tanlang:', ru: '🌾 Выберите культуру:' },
  askMethod: { uz: '💧 Sug‘orish usulini tanlang:', ru: '💧 Выберите способ полива:' },
  askSoil: { uz: '🟫 Tuproq turini tanlang:', ru: '🟫 Выберите тип почвы:' },
  done: {
    uz: '✅ Tayyor! Endi har kuni ertalab sug‘orish maslahatini yuboraman.\n\n/today — bugungi me’yor\n/stop — eslatmalarni to‘xtatish',
    ru: '✅ Готово! Теперь каждое утро я буду присылать совет по поливу.\n\n/today — норма на сегодня\n/stop — остановить напоминания',
  },
  offSeason: { uz: 'Hozir bu ekin uchun sug‘orish mavsumi emas 🌙', ru: 'Сейчас не сезон полива для этой культуры 🌙' },
  stopped: { uz: '🔕 Eslatmalar to‘xtatildi. Qayta yoqish: /start', ru: '🔕 Напоминания остановлены. Включить снова: /start' },
  needSetup: { uz: 'Avval /start bosing va dalangizni sozlang.', ru: 'Сначала нажмите /start и настройте поле.' },
  help: {
    uz: 'ℹ️ <b>Tomchi bot</b>\n/start — sozlash\n/today — bugungi suv me’yori\n/stop — eslatmalarni o‘chirish\n\nTo‘liq ilova: dalangiz taqvimi, kasallik tashxisi va tejamkorlik hisobi.',
    ru: 'ℹ️ <b>Tomchi bot</b>\n/start — настройка\n/today — норма воды на сегодня\n/stop — выключить напоминания\n\nПолное приложение: календарь поля, диагностика болезней и учёт экономии.',
  },
  dailyHeader: { uz: '☀️ <b>Bugungi sug‘orish</b>', ru: '☀️ <b>Полив на сегодня</b>' },
  rainSkip: { uz: '🌧️ Yaqin kunlarda yomg‘ir kutilmoqda — sug‘orishga shoshilmang.', ru: '🌧️ В ближайшие дни ожидается дождь — не спешите с поливом.' },
  waterLine: { uz: '💧 Bugun kerak: <b>{v} m³</b> ({mm} mm)', ru: '💧 Нужно сегодня: <b>{v} m³</b> ({mm} mm)' },
  stageLine: { uz: '🌱 Bosqich: {s}', ru: '🌱 Фаза: {s}' },
  intervalLine: { uz: '🔁 Har {n} kunda sug‘oring', ru: '🔁 Поливайте каждые {n} дней' },
};

export function m(key: string, lang: Lang, vars: Record<string, string | number> = {}): string {
  let s = M[key]?.[lang] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export const stageName: Record<string, { uz: string; ru: string }> = {
  initial: { uz: 'Unish', ru: 'Всходы' },
  development: { uz: 'Rivojlanish', ru: 'Развитие' },
  mid: { uz: 'Gullash / hosil', ru: 'Цветение / плодоношение' },
  late: { uz: 'Pishish', ru: 'Созревание' },
};

export const methodName: Record<string, { uz: string; ru: string }> = {
  furrow: { uz: 'Egat (arig‘)', ru: 'Арычный' },
  sprinkler: { uz: 'Yomg‘irlatib', ru: 'Дождевание' },
  drip: { uz: 'Tomchilatib', ru: 'Капельный' },
};

export const soilName: Record<string, { uz: string; ru: string }> = {
  sandy: { uz: 'Qumloq', ru: 'Песчаная' },
  loam: { uz: 'O‘rtacha', ru: 'Средняя' },
  clay: { uz: 'Loyli', ru: 'Глинистая' },
};
