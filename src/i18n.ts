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
  // National impact
  nationalTitle: { uz: 'Butun O‘zbekiston bo‘yicha', ru: 'По всему Узбекистану' },
  nationalSub: { uz: 'Tomchi jamoasi birgalikda tejagan suv', ru: 'Сколько воды сообщество Tomchi сэкономило вместе' },
  nationalSaved: { uz: 'Jami tejalgan suv', ru: 'Всего сэкономлено воды' },
  nationalGrowing: { uz: 'va o‘smoqda', ru: 'и растёт' },
  nationalFields: { uz: 'faol dala', ru: 'активных полей' },
  nationalRegions: { uz: 'viloyat', ru: 'регионов' },
  mapTitle: { uz: 'Viloyatlar bo‘yicha tejamkorlik', ru: 'Экономия по регионам' },
  nationalEmpty: { uz: 'Hali ma’lumot yo‘q — birinchi bo‘ling!', ru: 'Пока нет данных — станьте первым!' },
  nationalLoading: { uz: 'Yuklanmoqda…', ru: 'Загрузка…' },
  mapTapHint: { uz: 'Batafsil uchun viloyatni bosing', ru: 'Нажмите на регион для деталей' },
  mapLegendLess: { uz: 'kam', ru: 'меньше' },
  mapLegendMore: { uz: 'ko‘p', ru: 'больше' },
  regionNoData: { uz: 'Hali ma’lumot yo‘q', ru: 'Пока нет данных' },
  regionFields: { uz: 'dala', ru: 'полей' },
  regionsRankTitle: { uz: 'Viloyatlar reytingi', ru: 'Рейтинг регионов' },
  regionsRankSub: { uz: 'Qaysi viloyat ko‘proq suv tejayapti', ru: 'Какой регион экономит больше воды' },
  yourRegion: { uz: 'sizniki', ru: 'ваш' },
  // Payback calculator
  calcOpen: { uz: 'Tomchilatib sug‘orish qoplanishini hisoblash', ru: 'Рассчитать окупаемость капельного полива' },
  calcTitle: { uz: 'Tomchilatib sug‘orish qoplanishi', ru: 'Окупаемость капельного полива' },
  calcArea: { uz: 'Maydon', ru: 'Площадь' },
  calcCostHa: { uz: 'Tizim narxi (so‘m/ga)', ru: 'Стоимость системы (сум/га)' },
  calcSubsidy: { uz: 'Davlat subsidiyasi', ru: 'Государственная субсидия' },
  calcNetCost: { uz: 'Sizning xarajatingiz', ru: 'Ваши затраты' },
  calcAnnualSave: { uz: 'Yillik tejamkorlik', ru: 'Экономия в год' },
  calcPayback: { uz: 'Qoplanish muddati', ru: 'Окупится за' },
  calcSeasons: { uz: 'mavsum', ru: 'сезонов' },
  calcNote: { uz: 'O‘zbekistonda tomchilatib sug‘orishga davlat subsidiyasi beriladi. Raqamlarni o‘zingiznikiga moslang.', ru: 'В Узбекистане на капельный полив выдаётся госсубсидия. Подставьте свои цифры.' },
  calcSaveWater: { uz: 'Suv tejamkorligi', ru: 'Экономия воды' },
  leaderTitle: { uz: 'Eng tejamkor dehqonlar', ru: 'Самые бережливые фермеры' },
  leaderSub: { uz: 'Mavsumda eng ko‘p suv tejaganlar reytingi', ru: 'Рейтинг тех, кто сэкономил больше всего воды' },
  leaderYou: { uz: 'Siz', ru: 'Вы' },
  // AI agronom chat
  tabAgronom: { uz: 'Agronom', ru: 'Агроном' },
  agronomTitle: { uz: 'AI-agronom', ru: 'AI-агроном' },
  agronomIntro: { uz: 'Dalangiz bo‘yicha istalgan savol: sug‘orish, o‘g‘it, kasallik, hosil, saqlash, sotish.', ru: 'Любой вопрос по вашему полю: полив, удобрения, болезни, урожай, хранение, продажа.' },
  agronomPlaceholder: { uz: 'Savolingizni yozing…', ru: 'Напишите ваш вопрос…' },
  agronomSend: { uz: 'Yuborish', ru: 'Отправить' },
  agronomClear: { uz: 'Tozalash', ru: 'Очистить' },
  agronomQ1: { uz: 'Barglar sarg‘aymoqda, nima qilay?', ru: 'Листья желтеют, что делать?' },
  agronomQ2: { uz: 'Hozir qanday o‘g‘it kerak?', ru: 'Какое удобрение нужно сейчас?' },
  agronomQ3: { uz: 'Hosilni qanday saqlayman?', ru: 'Как хранить урожай?' },
  // Soil
  stepSoil: { uz: 'Tuproq turi', ru: 'Тип почвы' },
  soil_sandy: { uz: 'Qumloq', ru: 'Песчаная' },
  soil_sandyDesc: { uz: 'Suv tez singadi — tez-tez sug‘oriladi', ru: 'Вода быстро уходит — поливать чаще' },
  soil_loam: { uz: 'O‘rtacha (bo‘z tuproq)', ru: 'Средняя (суглинок)' },
  soil_loamDesc: { uz: 'Ko‘pchilik dalalar uchun odatiy', ru: 'Обычная для большинства полей' },
  soil_clay: { uz: 'Loyli (og‘ir)', ru: 'Глинистая (тяжёлая)' },
  soil_clayDesc: { uz: 'Suvni uzoq saqlaydi — kamroq sug‘oriladi', ru: 'Долго держит воду — поливать реже' },
  // Journal
  iWatered: { uz: 'Sug‘ordim', ru: 'Полил' },
  itRained: { uz: 'Yomg‘ir yog‘di', ru: 'Был дождь' },
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
  tutDone: { uz: 'Tushunarli, boshladik!', ru: 'Понятно, начнём!' },
  tut1Title: { uz: 'Xush kelibsiz, dehqon aka!', ru: 'Добро пожаловать, фермер!' },
  tut1Body: {
    uz: 'Tomchi — cho‘ntagingizdagi agronom. U dalangiz uchun qancha suv kerakligini ilmiy hisoblab beradi, kasalliklarni aniqlaydi va suvni tejashga yordam beradi. Hammasi bepul va internetsiz ham ishlaydi. Keling, 1 daqiqada hammasini ko‘rsatamiz.',
    ru: 'Томчи — агроном в вашем кармане. Он по науке считает, сколько воды нужно вашему полю, определяет болезни растений и помогает экономить воду. Всё бесплатно и работает даже без интернета. Давайте за 1 минуту всё покажем.',
  },
  tut2Title: { uz: '«Bugun» — kunlik suv me’yori', ru: '«Сегодня» — норма воды на день' },
  tut2Body: {
    uz: 'Katta tomchi ichidagi suv — bugungi me’yor. Raqam — dalangizga bugun kerak bo‘lgan suv (litr yoki m³). Sug‘organingizda «Sug‘ordim ✓» tugmasini bosing — keyingi sug‘orishgacha necha kun qolganini ko‘rsatamiz. Yomg‘ir yog‘sa — «Yomg‘ir yog‘di» tugmasini bosing, u sug‘orish o‘rniga o‘tadi.',
    ru: 'Вода внутри большой капли — сегодняшняя норма. Цифра — сколько воды нужно вашему полю сегодня (в литрах или м³). Полили — нажмите «Полил ✓», и мы покажем, сколько дней до следующего полива. Прошёл дождь — нажмите «Был дождь», он засчитается вместо полива.',
  },
  tut3Title: { uz: 'Bir nechta dala', ru: 'Несколько полей' },
  tut3Body: {
    uz: 'Yuqoridagi tugmalar — dalalaringiz. Har biri uchun alohida hisob: boshqa ekin, boshqa tuproq, boshqa me’yor. «+ Dala qo‘shish» bilan istalgancha dala kiritishingiz mumkin.',
    ru: 'Кнопки сверху — ваши поля. Для каждого свой расчёт: другая культура, другая почва, другая норма. Через «+ Добавить поле» можно завести сколько угодно полей.',
  },
  tut4Title: { uz: '«Taqvim» — mavsum rejasi', ru: '«Календарь» — план сезона' },
  tut4Body: {
    uz: 'Yaqin sug‘orish kunlari aniq sanalar bilan: qachon va qancha suv. Pastda — butun mavsum bo‘yicha oylik jadval: qaysi oyda suv ko‘p ketadi, mavsumda jami qancha kerak. Ekish va hosilni rejalashtirishga qulay.',
    ru: 'Ближайшие поливы с точными датами: когда и сколько воды. Ниже — график по месяцам на весь сезон: в каком месяце воды уйдёт больше всего и сколько всего нужно за сезон. Удобно планировать посевную и урожай.',
  },
  tut5Title: { uz: '«Agronom» — AI yordamchi', ru: '«Агроном» — ИИ-помощник' },
  tut5Body: {
    uz: 'Ekin haqida istalgan savolni yozing yoki kasal barg suratini yuboring — AI-agronom kasallikni aniqlab, nima qilishni oddiy tilda tushuntiradi. Suhbat saqlanadi, istagan vaqtda qaytib ko‘rasiz.',
    ru: 'Напишите любой вопрос о культуре или пришлите фото больного листа — ИИ-агроном определит болезнь и простыми словами подскажет, что делать. Переписка сохраняется, к ней можно вернуться в любой момент.',
  },
  tutVoiceTitle: { uz: 'Ovoz bilan so‘rang', ru: 'Спросите голосом' },
  tutVoiceBody: {
    uz: 'Yozishga qiynalsangiz — «Agronom» sahifasida mikrofon tugmasini bosing va savolingizni ovoz bilan ayting. Ilova nutqni matnga aylantiradi va agronomdek javob beradi. Javobni ovoz bilan ham eshitishingiz mumkin.',
    ru: 'Трудно печатать? На странице «Агроном» нажмите кнопку микрофона и просто скажите вопрос голосом — по-узбекски или по-русски. Приложение переведёт речь в текст и ответит, как агроном. Ответ можно и прослушать вслух.',
  },
  tutSatTitle: { uz: 'Kosmosdan dala salomatligi', ru: 'Здоровье поля из космоса' },
  tutSatBody: {
    uz: '«Bugun» sahifasida dalangizni xaritada bir marta belgilang — sun’iy yo‘ldosh (Sentinel-2) o‘simliklar holatini ko‘rsatadi. Yashil — yaxshi, sariq va jigarrang — suv yoki oziq yetishmayapti. Foiz qancha baland bo‘lsa, dala shuncha sog‘lom. Har 5 kunda yangilanadi, bepul.',
    ru: 'На странице «Сегодня» отметьте поле на карте один раз — спутник (Sentinel-2) покажет состояние ваших растений. Зелёный — хорошо, жёлтый и коричневый — не хватает воды или питания. Чем выше процент, тем здоровее поле. Обновляется каждые 5 дней, бесплатно.',
  },
  tut6Title: { uz: '«Tejamkorlik» — sizning foydangiz', ru: '«Экономия» — ваша выгода' },
  tut6Body: {
    uz: 'Ilova bo‘yicha sug‘orsangiz, mavsumda qancha suv va pul tejashingizni ko‘rasiz, hisoblagich esa tomchilatib sug‘orish qancha vaqtda o‘zini oqlashini ko‘rsatadi. Suvni tejash — Orol uchun ham, cho‘ntagingiz uchun ham foyda. Savollar bo‘lsa — yuqoridagi «?» tugmasini bosing, bu qo‘llanma qayta ochiladi.',
    ru: 'Поливая по приложению, вы видите, сколько воды и денег сэкономите за сезон, а калькулятор покажет, за сколько окупится капельный полив. Экономия воды — польза и для Арала, и для вашего кармана. Появятся вопросы — нажмите «?» сверху, эта инструкция откроется снова.',
  },
  help: { uz: 'Yordam', ru: 'Помощь' },
  // Telegram pairing
  connectTg: { uz: 'Telegram-botni ulash', ru: 'Подключить Telegram-бот' },
  connectTgDesc: { uz: 'Sug‘orish eslatmalarini Telegramda oling', ru: 'Получайте напоминания о поливе в Telegram' },
  pairTitle: { uz: 'Telegram’ga ulash', ru: 'Подключение Telegram' },
  pairStep1: { uz: '1. Telegramda @tomchiaibot ni oching', ru: '1. Откройте @tomchiaibot в Telegram' },
  pairStep2: { uz: '2. Botga quyidagi buyruqni yuboring:', ru: '2. Отправьте боту команду:' },
  pairStep3: { uz: '3. Bo‘ldi! Bot dalangizni ko‘radi va har kuni eslatadi.', ru: '3. Готово! Бот увидит ваше поле и будет напоминать каждый день.' },
  pairGenerating: { uz: 'Kod tayyorlanmoqda…', ru: 'Генерируем код…' },
  pairError: { uz: 'Kod olinmadi. Keyinroq urinib ko‘ring.', ru: 'Не удалось получить код. Попробуйте позже.' },
  pairExpires: { uz: 'Kod 15 daqiqa amal qiladi', ru: 'Код действует 15 минут' },
  openBot: { uz: 'Botni ochish', ru: 'Открыть бота' },
  copied: { uz: 'Nusxa olindi', ru: 'Скопировано' },
  close: { uz: 'Yopish', ru: 'Закрыть' },
  // AI doctor
  aiDoctor: { uz: 'AI shifokor', ru: 'AI-доктор' },
  aiTab: { uz: 'AI', ru: 'AI' },
  treeTab: { uz: 'Belgilar bo‘yicha', ru: 'По признакам' },
  aiIntro: { uz: 'Muammoni o‘z so‘zlaringiz bilan yozing yoki rasm yuklang — AI tahlil qiladi.', ru: 'Опишите проблему своими словами или загрузите фото — AI проанализирует.' },
  aiPlaceholder: { uz: 'Masalan: pastki barglar sarg‘ayib, chetlari qurimoqda…', ru: 'Например: нижние листья желтеют, края подсыхают…' },
  aiAsk: { uz: 'AI’dan so‘rash', ru: 'Спросить AI' },
  aiPhoto: { uz: 'Rasm bo‘yicha', ru: 'Диагноз по фото' },
  aiThinking: { uz: 'AI o‘ylayapti…', ru: 'AI думает…' },
  aiError: { uz: 'AI hozir javob bera olmadi. Belgilar bo‘yicha tekshiring.', ru: 'AI сейчас недоступен. Проверьте по признакам.' },
  aiNotConfigured: { uz: 'AI shifokor hali ulanmagan. Belgilar bo‘yicha tashxisdan foydalaning.', ru: 'AI-доктор ещё не подключён. Используйте диагностику по признакам.' },
  aiDisclaimer: { uz: 'AI javobi maslahat xarakterida. Agronom bilan tasdiqlang.', ru: 'Ответ AI носит рекомендательный характер. Подтвердите у агронома.' },
  // AI chat
  chatTitle: { uz: 'AI-agronom', ru: 'AI-агроном' },
  chatEmpty: { uz: 'Savol bering yoki o‘simlik rasmini yuboring — javob beraman.', ru: 'Задайте вопрос или пришлите фото растения — помогу разобраться.' },
  chatPlaceholder: { uz: 'Savolingizni yozing…', ru: 'Напишите вопрос…' },
  chatClear: { uz: 'Suhbatni tozalash', ru: 'Очистить чат' },
  chatClearAsk: { uz: 'Butun suhbat o‘chirilsinmi?', ru: 'Очистить всю переписку?' },
  chatGuided: { uz: 'Belgilar bo‘yicha tez tekshiruv', ru: 'Быстрая проверка по признакам' },
  photoAttached: { uz: 'Rasm biriktirildi', ru: 'Фото прикреплено' },
  chatSug1: { uz: 'Barglar sarg‘aymoqda', ru: 'Листья желтеют' },
  chatSug2: { uz: 'Qachon o‘g‘itlash kerak?', ru: 'Когда вносить подкормку?' },
  chatSug3: { uz: 'Zararkunandalarga qarshi nima sepay?', ru: 'Чем обработать от вредителей?' },
  // Voice input / output
  voiceStart: { uz: 'Ovozli savol', ru: 'Спросить голосом' },
  voiceStop: { uz: 'To‘xtatish', ru: 'Остановить' },
  voiceListening: { uz: 'Tinglayapman… gapiring', ru: 'Слушаю… говорите' },
  voiceTranscribing: { uz: 'Nutqni o‘qiyapman…', ru: 'Распознаю речь…' },
  voiceError: { uz: 'Eshitmadim, qayta urinib ko‘ring', ru: 'Не расслышал, попробуйте ещё раз' },
  voiceDenied: { uz: 'Mikrofonga ruxsat bering', ru: 'Разрешите доступ к микрофону' },
  voiceHintEmpty: { uz: 'Yozishga qiynalsangiz — mikrofon tugmasini bosib, savolingizni ayting.', ru: 'Трудно печатать? Нажмите микрофон и просто скажите вопрос голосом.' },
  voiceListen: { uz: 'Javobni eshitish', ru: 'Прослушать ответ' },
  // Weather
  liveWeather: { uz: 'Jonli ob-havo', ru: 'Живая погода' },
  climateNormal: { uz: 'Iqlim me’yori', ru: 'Климатическая норма' },
  rainSoon: { uz: 'Yomg‘ir kutilmoqda — sug‘orishni kuting', ru: 'Ожидается дождь — отложите полив' },
  rainToday: { uz: 'Bugun yomg‘ir — sug‘ormang', ru: 'Сегодня дождь — не поливайте' },
  rainInDays: { uz: '%s: %s mm yomg‘ir. Sug‘orishga shoshilmang.', ru: '%s: дождь %s мм. Не спешите с поливом.' },
  weatherOffline: { uz: 'Ob-havo yuklanmadi — iqlim me’yori ishlatilmoqda', ru: 'Погода не загрузилась — используется климатическая норма' },
  forecast7: { uz: '7 kunlik ob-havo', ru: 'Погода на 7 дней' },
  // History
  history: { uz: 'Sug‘orish tarixi', ru: 'История поливов' },
  noHistory: { uz: 'Hali sug‘orish belgilanmagan', ru: 'Поливов пока не отмечено' },
  typeWatered: { uz: 'Sug‘orish', ru: 'Полив' },
  typeRain: { uz: 'Yomg‘ir', ru: 'Дождь' },
  clearHistory: { uz: 'Tarixni tozalash', ru: 'Очистить историю' },
  // PDF report
  exportPdf: { uz: 'Agronom uchun hisobot (PDF)', ru: 'Отчёт для агронома (PDF)' },
  reportTitle: { uz: 'Sug‘orish hisoboti', ru: 'Отчёт по орошению' },
  reportField: { uz: 'Dala', ru: 'Поле' },
  reportGenerated: { uz: 'Tuzilgan sana', ru: 'Дата составления' },
  reportSeasonNeed: { uz: 'Mavsumiy suv talabi', ru: 'Сезонная потребность в воде' },
  reportPrint: { uz: 'Chop etish / PDF saqlash', ru: 'Печать / Сохранить PDF' },
  print: { uz: 'Chop etish', ru: 'Печать' },
  reportUsage: { uz: 'Suv sarfi', ru: 'Расход воды' },
  reportWaterings: { uz: 'Sug‘orishlar soni', ru: 'Число поливов' },
  reportRains: { uz: 'Yomg‘irlar soni', ru: 'Число дождей' },
  reportApplied: { uz: 'Jami sarflangan suv', ru: 'Всего израсходовано воды' },
  reportSavedMoney: { uz: 'Tejalgan mablag‘', ru: 'Сэкономлено денег' },
  reportDate: { uz: 'Sana', ru: 'Дата' },
  reportEvent: { uz: 'Hodisa', ru: 'Событие' },
  reportVolume: { uz: 'Hajm', ru: 'Объём' },
  // misc
  yes: { uz: 'Ha', ru: 'Да' },
  no: { uz: "Yo'q", ru: 'Нет' },
  methodology: {
    uz: 'Hisob-kitoblar FAO-56 (Penman-Monteith) metodikasi va O‘zGidromet iqlim me’yorlariga asoslangan.',
    ru: 'Расчёты основаны на методике FAO-56 (Пенман-Монтейт) и климатических нормах Узгидромета.',
  },
  // Satellite field health (NDVI)
  satTitle: { uz: 'Kosmosdan dala salomatligi', ru: 'Здоровье поля из космоса' },
  satSub: { uz: 'Sentinel-2 sun’iy yo‘ldoshi · NDVI', ru: 'Спутник Sentinel-2 · NDVI' },
  satSetLocation: { uz: 'Dalani xaritada belgilang', ru: 'Отметьте поле на карте' },
  satSetHint: {
    uz: 'Dalangiz joylashuvini ko‘rsating — sun’iy yo‘ldosh o‘simliklar holatini ko‘rsatadi.',
    ru: 'Укажите расположение поля — спутник покажет состояние растений.',
  },
  satMark: { uz: 'Dalani belgilash', ru: 'Отметить поле' },
  satHealth: { uz: 'O‘simlik holati', ru: 'Состояние растений' },
  // Short status word + a one-line plain-language action for a farmer.
  satHealthy: { uz: 'Yaxshi', ru: 'Хорошее' },
  satHealthyTip: { uz: 'O‘simliklar yaxshi rivojlanmoqda. Shu tartibda davom eting.', ru: 'Растения развиваются хорошо. Продолжайте так же.' },
  satModerate: { uz: 'O‘rtacha', ru: 'Среднее' },
  satModerateTip: { uz: 'Nimadir yetishmayapti. Sug‘orish va oziqlantirishni tekshiring.', ru: 'Чего-то не хватает. Проверьте полив и подкормку.' },
  satStressed: { uz: 'Zaif', ru: 'Слабое' },
  satStressedTip: { uz: 'Ehtimol suv kam. Dalani sug‘oring va o‘simliklarni ko‘zdan kechiring.', ru: 'Скорее всего мало воды. Полейте поле и осмотрите растения.' },
  satNoData: { uz: 'Bulut to‘sgan', ru: 'Закрыто облаками' },
  satNoDataTip: { uz: 'Osmon bulutli — snapshot yo‘q. Bir necha kundan keyin qarang.', ru: 'Небо в облаках — снимка нет. Загляните через несколько дней.' },
  satScene: { uz: 'Snapshot sanasi', ru: 'Дата снимка' },
  satLegendLow: { uz: 'Bo‘sh / stress', ru: 'Голая / стресс' },
  satLegendHigh: { uz: 'Zich o‘simlik', ru: 'Густая зелень' },
  satLoading: { uz: 'Sun’iy yo‘ldosh ma’lumoti yuklanmoqda…', ru: 'Загружаем данные спутника…' },
  satError: { uz: 'Hozircha ma’lumot yo‘q. Keyinroq urinib ko‘ring.', ru: 'Данные пока недоступны. Попробуйте позже.' },
  satRefresh: { uz: 'Yangilash', ru: 'Обновить' },
  // Map picker
  pickTitle: { uz: 'Dalangizni toping', ru: 'Найдите ваше поле' },
  pickHint: {
    uz: 'Xaritani suring va dala markaziga bosing. Sun’iy yo‘ldosh ko‘rinishida dalangizni taning.',
    ru: 'Двигайте карту и нажмите на центр поля. На спутниковом снимке найдите свой участок.',
  },
  pickGps: { uz: 'Mening joylashuvim', ru: 'Моё местоположение' },
  pickSave: { uz: 'Saqlash', ru: 'Сохранить' },
  pickCancel: { uz: 'Bekor qilish', ru: 'Отмена' },
  pickGpsFail: { uz: 'Joylashuvni aniqlab bo‘lmadi', ru: 'Не удалось определить местоположение' },
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
