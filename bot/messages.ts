import type { Lang } from './subscribers';

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
  linkUsage: { uz: 'Ilovadan olingan kodni yuboring: <code>/link 123456</code>', ru: 'Отправьте код из приложения: <code>/link 123456</code>' },
  linkOk: { uz: '✅ Ilova ulandi! Endi dalangiz ma’lumotlari shu yerda. /today ni bosing.', ru: '✅ Приложение подключено! Теперь данные вашего поля здесь. Нажмите /today.' },
  linkFail: { uz: '❌ Kod noto‘g‘ri yoki muddati o‘tgan. Ilovada yangi kod oling.', ru: '❌ Код неверный или истёк. Сгенерируйте новый код в приложении.' },
  linkHint: { uz: '\n\n📱 Ilovada dala yaratgan bo‘lsangiz, uni ulash uchun: /link kod', ru: '\n\n📱 Если вы создали поле в приложении, подключите его: /link код' },
  fieldHeader: { uz: '🌱 <b>{crop}</b> ({area} ga · {region})', ru: '🌱 <b>{crop}</b> ({area} га · {region})' },
  noFields: {
    uz: 'Sizda hali dala yo‘q. Ilovada dala yarating yoki /link kod bilan ulang.',
    ru: 'У вас пока нет поля. Создайте поле в приложении или подключите через /link код.',
  },
  menu: {
    uz: '📋 Buyruqlar:\n/fields — dalalaringiz\n/today — bugungi suv me’yori\n/calendar — mavsumiy taqvim\n/savings — suv va pul tejamkorligi\n/history — sug‘orish tarixi\n/stop — eslatmalarni o‘chirish',
    ru: '📋 Команды:\n/fields — ваши поля\n/today — норма воды на сегодня\n/calendar — сезонный календарь\n/savings — экономия воды и денег\n/history — история поливов\n/stop — выключить напоминания',
  },
  calendarHeader: { uz: '📅 <b>Mavsumiy sug‘orish taqvimi</b>', ru: '📅 <b>Сезонный календарь полива</b>' },
  calendarTotal: { uz: 'Mavsum jami: <b>{v} m³</b>', ru: 'Итого за сезон: <b>{v} m³</b>' },
  savingsHeader: { uz: '🌊 <b>Sizning tejamkorligingiz</b>', ru: '🌊 <b>Ваша экономия</b>' },
  savingsWater: { uz: '💧 Tejalgan suv: <b>{v} m³</b> ({method}, egatga nisbatan)', ru: '💧 Сэкономлено воды: <b>{v} m³</b> ({method}, против арычного)' },
  savingsMoney: { uz: '💰 Tejalgan mablag‘: <b>{v} so‘m</b> / mavsum', ru: '💰 Сэкономлено денег: <b>{v} сум</b> / сезон' },
  savingsBest: { uz: 'Siz eng tejamkor usuldan foydalanyapsiz — barakalla!', ru: 'Вы используете самый экономный способ — отлично!' },
  historyHeader: { uz: '📖 <b>Sug‘orish tarixi</b> (oxirgi {n})', ru: '📖 <b>История поливов</b> (последние {n})' },
  historyEmpty: { uz: 'Hali sug‘orish qaydlari yo‘q. Ilovada suv quyganingizni belgilang.', ru: 'Пока нет записей о поливе. Отмечайте полив в приложении.' },
  historyWatered: { uz: '💧 {date} — sug‘orildi', ru: '💧 {date} — полив' },
  historyRain: { uz: '🌧️ {date} — yomg‘ir', ru: '🌧️ {date} — дождь' },
  // Fields picker + site link + smart alerts
  siteLine: { uz: '\n\n🌐 Ilova: {url}', ru: '\n\n🌐 Приложение: {url}' },
  openApp: { uz: '🌐 Ilovani ochish', ru: '🌐 Открыть приложение' },
  myFields: { uz: '🌾 Mening dalalarim', ru: '🌾 Мои поля' },
  fieldsHeader: { uz: '🌾 <b>Sizning dalalaringiz</b> ({n} ta)\nKo‘rish uchun dalani tanlang:', ru: '🌾 <b>Ваши поля</b> ({n})\nВыберите поле для просмотра:' },
  linkOkFields: { uz: '✅ Ilova ulandi! Barcha dalalaringiz shu yerda.', ru: '✅ Приложение подключено! Все ваши поля здесь.' },
  backFields: { uz: '◀ Dalalarga', ru: '◀ К полям' },
  stageChanged: { uz: '📢 <b>{crop}</b>: yangi bosqich — {stage}', ru: '📢 <b>{crop}</b>: новая фаза — {stage}' },
  fertilizerNow: { uz: '🌿 Oziqlantirish: {text}', ru: '🌿 Подкормка: {text}' },
  // Weather alerts (frost / heat / wind, next 3 days)
  frostAlert: {
    uz: '🥶 <b>Sovuq xavfi!</b> Kechasi harorat 0°C atrofida. Ko‘chat va nihollarni yoping, imkon bo‘lsa kechqurun sug‘oring — nam tuproq issiqni saqlaydi.',
    ru: '🥶 <b>Опасность заморозков!</b> Ночью около 0°C. Укройте рассаду и молодые растения; по возможности полейте вечером — влажная почва держит тепло.',
  },
  heatAlert: {
    uz: '🌡️ <b>Jazirama keladi!</b> Yaqin kunlarda +39°C dan yuqori. Erta tongda yoki kechqurun sug‘oring, suv me’yorini ~10% oshiring.',
    ru: '🌡️ <b>Идёт жара!</b> В ближайшие дни выше +39°C. Поливайте рано утром или вечером и увеличьте норму примерно на 10%.',
  },
  windAlert: {
    uz: '💨 <b>Kuchli shamol kutilmoqda.</b> Purkash (dori sepish) ishlarini qoldiring — dori shamolda uchib ketadi.',
    ru: '💨 <b>Ожидается сильный ветер.</b> Отложите опрыскивание — препарат снесёт ветром.',
  },
};

export const monthShort: Record<string, string[]> = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
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
