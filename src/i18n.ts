export type Lang = 'uz' | 'ru';

type Dict = Record<string, { uz: string; ru: string }>;

export const dict: Dict = {
  appName: { uz: 'Tomchi', ru: 'Томчи' },
  tagline: { uz: "Har bir tomchi hisobda", ru: 'Каждая капля на счету' },
  // Onboarding
  chooseLang: { uz: 'Tilni tanlang', ru: 'Выберите язык' },
  welcomeTitle: { uz: "Dalangiz uchun aqlli sug'orish", ru: 'Умный полив для вашего поля' },
  welcomeBody: {
    uz: "Tomchi FAO-56 ilmiy metodikasi asosida dalangiz uchun kunlik suv me'yorini hisoblaydi, kasalliklarni aniqlaydi va suvni tejashga yordam beradi.",
    ru: 'Томчи по научной методике FAO-56 рассчитывает дневную норму воды для вашего поля, помогает распознать болезни растений и экономить воду.',
  },
  start: { uz: 'Boshlash', ru: 'Начать' },
  back: { uz: 'Orqaga', ru: 'Назад' },
  next: { uz: 'Davom etish', ru: 'Продолжить' },
  stepRegion: { uz: 'Viloyatingizni tanlang', ru: 'Выберите ваш регион' },
  stepCrop: { uz: 'Ekiningizni tanlang', ru: 'Выберите культуру' },
  stepArea: { uz: 'Maydon hajmi', ru: 'Площадь поля' },
  stepMethod: { uz: "Sug'orish usuli", ru: 'Способ полива' },
  hectare: { uz: 'gektar', ru: 'га' },
  sotix: { uz: 'sotix', ru: 'соток' },
  areaHint: { uz: 'Maydonni kiriting (0.01 dan 500 gacha gektar)', ru: 'Введите площадь (от 0.01 до 500 га)' },
  finish: { uz: 'Dalani yaratish', ru: 'Создать поле' },
  // Methods
  furrow: { uz: 'Egat (arig‘) usuli', ru: 'Арычный (по бороздам)' },
  furrowDesc: { uz: 'An’anaviy usul, samaradorlik ~50%', ru: 'Традиционный способ, КПД ~50%' },
  sprinkler: { uz: 'Yomg‘irlatib', ru: 'Дождевание' },
  sprinklerDesc: { uz: 'Samaradorlik ~75%', ru: 'КПД ~75%' },
  drip: { uz: 'Tomchilatib', ru: 'Капельный' },
  dripDesc: { uz: 'Eng tejamkor, samaradorlik ~90%', ru: 'Самый экономный, КПД ~90%' },
  // Tabs
  tabToday: { uz: 'Bugun', ru: 'Сегодня' },
  tabCalendar: { uz: 'Taqvim', ru: 'Календарь' },
  tabDoctor: { uz: 'Tashxis', ru: 'Диагноз' },
  tabImpact: { uz: 'Tejamkorlik', ru: 'Экономия' },
  // Dashboard
  todayNeed: { uz: 'Bugungi suv me’yori', ru: 'Норма воды на сегодня' },
  perDay: { uz: 'kuniga', ru: 'в день' },
  litersPerDay: { uz: 'litr / kun', ru: 'литров / день' },
  m3PerDay: { uz: 'm³ / kun', ru: 'м³ / день' },
  stageNow: { uz: 'Hozirgi bosqich', ru: 'Текущая фаза' },
  nextWatering: { uz: 'Keyingi sug‘orish', ru: 'Следующий полив' },
  everyNDays: { uz: 'har %d kunda', ru: 'каждые %d дней' },
  waterPerIrrigation: { uz: 'Bir sug‘orishda', ru: 'За один полив' },
  advice: { uz: 'Bugungi maslahat', ru: 'Совет на сегодня' },
  fertilizer: { uz: 'Oziqlantirish', ru: 'Подкормка' },
  myField: { uz: 'Mening dalam', ru: 'Моё поле' },
  edit: { uz: 'O‘zgartirish', ru: 'Изменить' },
  et0Label: { uz: 'Bug‘lanish (ET₀)', ru: 'Испарение (ET₀)' },
  kcLabel: { uz: 'Ekin koeffitsiyenti (Kc)', ru: 'Коэффициент культуры (Kc)' },
  mmDay: { uz: 'mm/kun', ru: 'мм/день' },
  offSeason: {
    uz: 'Hozir bu ekin uchun mavsum emas. Taqvimda mavsum boshlanishini ko‘ring.',
    ru: 'Сейчас не сезон для этой культуры. Смотрите начало сезона в календаре.',
  },
  // Calendar
  seasonCalendar: { uz: 'Mavsumiy sug‘orish taqvimi', ru: 'Сезонный календарь полива' },
  month: { uz: 'Oy', ru: 'Месяц' },
  waterNeed: { uz: 'Suv me’yori', ru: 'Норма воды' },
  m3ha: { uz: 'm³/ga', ru: 'м³/га' },
  m3month: { uz: 'm³ / oy', ru: 'м³ / мес' },
  stage: { uz: 'Bosqich', ru: 'Фаза' },
  seasonTotal: { uz: 'Mavsum jami', ru: 'Итого за сезон' },
  forYourField: { uz: 'dalangiz uchun', ru: 'для вашего поля' },
  // Stages
  stage_initial: { uz: 'Unish', ru: 'Всходы' },
  stage_development: { uz: 'Rivojlanish', ru: 'Развитие' },
  stage_mid: { uz: 'Gullash / hosil', ru: 'Цветение / плодоношение' },
  stage_late: { uz: 'Pishish', ru: 'Созревание' },
  stage_off: { uz: 'Mavsumdan tashqari', ru: 'Вне сезона' },
  // Doctor
  doctorTitle: { uz: 'O‘simlik shifokori', ru: 'Доктор растений' },
  doctorIntro: {
    uz: 'Savollarga javob bering — kasallik yoki zararkunandani aniqlab, davolash bo‘yicha maslahat beramiz.',
    ru: 'Ответьте на вопросы — определим болезнь или вредителя и подскажем лечение.',
  },
  restart: { uz: 'Qaytadan boshlash', ru: 'Начать заново' },
  diagnosis: { uz: 'Ehtimoliy tashxis', ru: 'Вероятный диагноз' },
  treatment: { uz: 'Nima qilish kerak', ru: 'Что делать' },
  prevention: { uz: 'Oldini olish', ru: 'Профилактика' },
  doctorDisclaimer: {
    uz: 'Bu dastlabki baho. Aniq tashxis uchun agronom bilan maslahatlashing.',
    ru: 'Это предварительная оценка. Для точного диагноза обратитесь к агроному.',
  },
  // Impact
  impactTitle: { uz: 'Sizning tejamkorligingiz', ru: 'Ваша экономия' },
  vsFlood: { uz: 'egat usuliga nisbatan', ru: 'по сравнению с арычным поливом' },
  waterSavedSeason: { uz: 'Mavsumda tejaladigan suv', ru: 'Экономия воды за сезон' },
  moneySaved: { uz: 'Pul hisobida', ru: 'В деньгах' },
  som: { uz: 'so‘m', ru: 'сум' },
  perSeason: { uz: 'mavsumiga', ru: 'за сезон' },
  aralNote: {
    uz: 'Orol dengizi uchun har bir tomchi muhim. Tejalgan suv — kelajak avlodlar suvi.',
    ru: 'Для Аральского моря важна каждая капля. Сэкономленная вода — вода будущих поколений.',
  },
  equalPools: { uz: 'Bu %d ta suzish havzasiga teng', ru: 'Это %d олимпийских бассейнов' },
  switchToDrip: {
    uz: 'Tomchilatib sug‘orishga o‘tsangiz, yana %s m³ suv tejaysiz',
    ru: 'Перейдя на капельный полив, вы сэкономите ещё %s м³ воды',
  },
  alreadyBest: { uz: 'Siz eng tejamkor usuldan foydalanmoqdasiz — barakalla!', ru: 'Вы используете самый экономный способ — отлично!' },
  yourMethod: { uz: 'Sizning usulingiz', ru: 'Ваш способ' },
  efficiency: { uz: 'samaradorlik', ru: 'КПД' },
  // Soil
  stepSoil: { uz: 'Tuproq turi', ru: 'Тип почвы' },
  soil_sandy: { uz: 'Qumloq', ru: 'Песчаная' },
  soil_sandyDesc: { uz: 'Suv tez singadi — tez-tez sug‘oriladi', ru: 'Вода быстро уходит — поливать чаще' },
  soil_loam: { uz: 'O‘rtacha (bo‘z tuproq)', ru: 'Средняя (суглинок)' },
  soil_loamDesc: { uz: 'Ko‘pchilik dalalar uchun odatiy', ru: 'Обычная для большинства полей' },
  soil_clay: { uz: 'Loyli (og‘ir)', ru: 'Глинистая (тяжёлая)' },
  soil_clayDesc: { uz: 'Suvni uzoq saqlaydi — kamroq sug‘oriladi', ru: 'Долго держит воду — поливать реже' },
  // Journal
  iWatered: { uz: 'Sug‘ordim ✓', ru: 'Полил ✓' },
  itRained: { uz: 'Yomg‘ir yog‘di 🌧', ru: 'Был дождь 🌧' },
  daysToWatering: { uz: 'Sug‘orishgacha', ru: 'До полива' },
  daysShort: { uz: 'kun', ru: 'дн.' },
  waterToday: { uz: 'Bugun sug‘oring!', ru: 'Поливайте сегодня!' },
  overdue: { uz: 'Sug‘orish kechikdi — bugun sug‘oring', ru: 'Полив просрочен — полейте сегодня' },
  notWateredYet: { uz: 'Sug‘organingizni belgilang — eslatib turamiz', ru: 'Отмечайте поливы — мы напомним о следующем' },
  lastWatered: { uz: 'Oxirgi sug‘orish', ru: 'Последний полив' },
  rainNote: { uz: 'Yomg‘ir sug‘orish o‘rniga o‘tadi', ru: 'Дождь засчитывается как полив' },
  // Fields
  addField: { uz: '+ Dala qo‘shish', ru: '+ Добавить поле' },
  deleteField: { uz: 'Dalani o‘chirish', ru: 'Удалить поле' },
  cancel: { uz: 'Bekor qilish', ru: 'Отмена' },
  // Calendar extras
  upcoming: { uz: 'Yaqin sug‘orishlar', ru: 'Ближайшие поливы' },
  wateringsCount: { uz: 'sug‘orish', ru: 'поливов' },
  today: { uz: 'Bugun', ru: 'Сегодня' },
  tomorrow: { uz: 'Ertaga', ru: 'Завтра' },
  monthDetail: { uz: 'Oyni tanlab, batafsil ko‘ring', ru: 'Нажмите на месяц — покажем детали' },
  perMonth: { uz: 'oyiga', ru: 'в месяц' },
  intervalLabel: { uz: 'Sug‘orish oralig‘i', ru: 'Интервал полива' },
  // Tutorial
  tutSkip: { uz: 'O‘tkazib yuborish', ru: 'Пропустить' },
  tutDone: { uz: 'Tushunarli!', ru: 'Понятно!' },
  tut1Title: { uz: 'Bugun — suv me’yori', ru: 'Сегодня — норма воды' },
  tut1Body: { uz: 'Katta tomchi dalangizga bugun qancha suv kerakligini ko‘rsatadi. «Sug‘ordim» tugmasini bosing — keyingi sug‘orishni eslatamiz.', ru: 'Большая капля показывает, сколько воды нужно вашему полю сегодня. Нажимайте «Полил» — напомним о следующем поливе.' },
  tut2Title: { uz: 'Taqvim — mavsum rejasi', ru: 'Календарь — план сезона' },
  tut2Body: { uz: 'Qaysi oyda qancha suv ketishini va yaqin sug‘orish kunlarini ko‘rasiz.', ru: 'Видно, сколько воды уйдёт в каждом месяце, и даты ближайших поливов.' },
  tut3Title: { uz: 'Tashxis — o‘simlik shifokori', ru: 'Диагноз — доктор растений' },
  tut3Body: { uz: 'Ekiningiz kasal bo‘lsa — belgilarni tanlang, kasallikni aniqlab davosini aytamiz.', ru: 'Если растение заболело — выберите признаки, определим болезнь и подскажем лечение.' },
  tut4Title: { uz: 'Tejamkorlik — hisobingiz', ru: 'Экономия — ваш счёт' },
  tut4Body: { uz: 'Qancha suv va pul tejayotganingizni ko‘rsatamiz. Suv — oltin!', ru: 'Показываем, сколько воды и денег вы экономите. Вода — золото!' },
  help: { uz: 'Yordam', ru: 'Помощь' },
  // misc
  yes: { uz: 'Ha', ru: 'Да' },
  no: { uz: "Yo'q", ru: 'Нет' },
  methodology: {
    uz: 'Hisob-kitoblar FAO-56 (Penman-Monteith) metodikasi va O‘zGidromet iqlim me’yorlariga asoslangan.',
    ru: 'Расчёты основаны на методике FAO-56 (Пенман-Монтейт) и климатических нормах Узгидромета.',
  },
};

export function t(key: string, lang: Lang): string {
  const e = dict[key];
  if (!e) return key;
  return e[lang];
}

export function fmt(s: string, ...args: (string | number)[]): string {
  let i = 0;
  return s.replace(/%[ds]/g, () => String(args[i++] ?? ''));
}

const monthShort: Record<Lang, string[]> = {
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
};

// Intl lacks Uzbek month names in some browsers — format manually
export function formatDate(d: Date, lang: Lang): string {
  return `${d.getDate()} ${monthShort[lang][d.getMonth()]}`;
}

export function formatNum(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'uz' ? 'uz-Latn-UZ' : 'ru-RU', {
    maximumFractionDigits: n < 10 ? 1 : 0,
  }).format(n);
}
