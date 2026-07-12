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

export function formatNum(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'uz' ? 'uz-Latn-UZ' : 'ru-RU', {
    maximumFractionDigits: n < 10 ? 1 : 0,
  }).format(n);
}
