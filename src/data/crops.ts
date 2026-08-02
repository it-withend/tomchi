// Crop coefficients (Kc) and stage lengths from FAO-56 Table 12/11,
// adapted to Central Asian planting windows.
export type StageKey = 'initial' | 'development' | 'mid' | 'late';

// Icon name for the web app. Kept as a plain string union (not imported from the
// Icon component) so the Telegram bot can import this file without pulling React
// into a Node process. components/Icon.tsx folds these into its own IconName.
export type CropIcon =
  | 'cotton' | 'wheat' | 'tomato' | 'grapes' | 'apple' | 'melon' | 'potato';

export interface Crop {
  id: string;
  /** Telegram-only. Bot messages are plain text, so the app never renders this. */
  emoji: string;
  icon: CropIcon;
  name: { uz: string; ru: string };
  plantMonth: number; // 0-based month when season starts
  /**
   * Effective rooting depth in metres, at planting and once fully developed.
   * FAO-56 Table 22 gives a range; the lower end is used, as that table directs
   * for irrigated conditions. Drives how much water the root zone can hold.
   */
  rootDepth: { start: number; max: number };
  /** Share of available water the crop may lose before it suffers (FAO-56 `p`). */
  depletion: number;
  stages: { key: StageKey; days: number; kc: number }[];
  // recommended irrigation interval (days) per stage, by method
  interval: Record<StageKey, { furrow: number; sprinkler: number; drip: number }>;
  fertilizer: { stage: StageKey; text: { uz: string; ru: string } }[];
}

const std = (f: number[], s: number[], d: number[]) =>
  ({
    initial: { furrow: f[0], sprinkler: s[0], drip: d[0] },
    development: { furrow: f[1], sprinkler: s[1], drip: d[1] },
    mid: { furrow: f[2], sprinkler: s[2], drip: d[2] },
    late: { furrow: f[3], sprinkler: s[3], drip: d[3] },
  }) as Crop['interval'];

export const crops: Crop[] = [
  {
    id: 'cotton',
    emoji: '🌱',
    icon: 'cotton',
    rootDepth: { start: 0.3, max: 1.0 },
    depletion: 0.65,
    name: { uz: 'Paxta', ru: 'Хлопчатник' },
    plantMonth: 3, // April
    stages: [
      { key: 'initial', days: 30, kc: 0.35 },
      { key: 'development', days: 50, kc: 0.75 },
      { key: 'mid', days: 55, kc: 1.18 },
      { key: 'late', days: 45, kc: 0.6 },
    ],
    interval: std([14, 10, 8, 14], [10, 7, 5, 10], [3, 2, 1, 3]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Azot (N) 30% yillik me’yordan — unish davrida', ru: 'Азот (N) 30% годовой нормы — в период всходов' } },
      { stage: 'development', text: { uz: 'Shonalash davrida azot + fosfor bering', ru: 'В фазе бутонизации внесите азот + фосфор' } },
      { stage: 'mid', text: { uz: 'Gullashda kaliy (K) muhim — 40 kg/ga', ru: 'При цветении важен калий (K) — 40 кг/га' } },
      { stage: 'late', text: { uz: 'Pishishda oziqlantirish to‘xtatiladi', ru: 'При созревании подкормка прекращается' } },
    ],
  },
  {
    id: 'wheat',
    emoji: '🌾',
    icon: 'wheat',
    rootDepth: { start: 0.3, max: 1.5 },
    depletion: 0.55,
    name: { uz: 'Kuzgi bug‘doy', ru: 'Озимая пшеница' },
    plantMonth: 9, // October
    stages: [
      { key: 'initial', days: 40, kc: 0.4 },
      { key: 'development', days: 120, kc: 0.75 }, // winter dormancy simplified
      { key: 'mid', days: 60, kc: 1.15 },
      { key: 'late', days: 30, kc: 0.3 },
    ],
    interval: std([20, 25, 12, 20], [15, 18, 9, 15], [5, 6, 3, 5]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Ekishda fosfor (P) asosi — 60 kg/ga', ru: 'При посеве основа — фосфор (P), 60 кг/га' } },
      { stage: 'development', text: { uz: 'Erta bahorda azot bilan oziqlantiring', ru: 'Ранней весной подкормите азотом' } },
      { stage: 'mid', text: { uz: 'Boshoqlashda 2-azot oziqlantirish', ru: 'В колошение — вторая азотная подкормка' } },
      { stage: 'late', text: { uz: 'Pishishda sug‘orish va oziqlantirish kamayadi', ru: 'При созревании полив и подкормки сокращаются' } },
    ],
  },
  {
    id: 'tomato',
    emoji: '🍅',
    icon: 'tomato',
    rootDepth: { start: 0.25, max: 0.8 },
    depletion: 0.4,
    name: { uz: 'Pomidor', ru: 'Томаты' },
    plantMonth: 3,
    stages: [
      { key: 'initial', days: 30, kc: 0.6 },
      { key: 'development', days: 40, kc: 0.85 },
      { key: 'mid', days: 45, kc: 1.15 },
      { key: 'late', days: 30, kc: 0.8 },
    ],
    interval: std([7, 6, 5, 7], [5, 4, 3, 5], [2, 1, 1, 2]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Ko‘chat tutgach — azotli oziqlantirish', ru: 'После приживания рассады — азотная подкормка' } },
      { stage: 'development', text: { uz: 'Gullash oldidan fosfor-kaliy bering', ru: 'Перед цветением — фосфорно-калийная подкормка' } },
      { stage: 'mid', text: { uz: 'Meva tugishda har 10 kunda kaliy', ru: 'При завязывании плодов калий каждые 10 дней' } },
      { stage: 'late', text: { uz: 'Azotni to‘xtating — mevalar shirin bo‘ladi', ru: 'Прекратите азот — плоды будут слаще' } },
    ],
  },
  {
    id: 'grapes',
    emoji: '🍇',
    icon: 'grapes',
    rootDepth: { start: 0.4, max: 1.2 },
    depletion: 0.35,
    name: { uz: 'Uzum', ru: 'Виноград' },
    plantMonth: 3,
    stages: [
      { key: 'initial', days: 30, kc: 0.3 },
      { key: 'development', days: 60, kc: 0.6 },
      { key: 'mid', days: 70, kc: 0.85 },
      { key: 'late', days: 40, kc: 0.45 },
    ],
    interval: std([18, 14, 10, 18], [14, 10, 8, 14], [4, 3, 2, 4]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Kurtak yozilishida azot bering', ru: 'При распускании почек внесите азот' } },
      { stage: 'development', text: { uz: 'Gullash oldidan mikroelementlar (bor, rux)', ru: 'Перед цветением — микроэлементы (бор, цинк)' } },
      { stage: 'mid', text: { uz: 'G‘ujum to‘lishida kaliy — mazani oshiradi', ru: 'При наливе ягод калий — улучшает вкус' } },
      { stage: 'late', text: { uz: 'Hosildan keyin fosfor-kaliy zaxirasi', ru: 'После урожая — запас фосфора и калия' } },
    ],
  },
  {
    id: 'apple',
    emoji: '🍎',
    icon: 'apple',
    rootDepth: { start: 0.4, max: 1.2 },
    depletion: 0.5,
    name: { uz: 'Olma bog‘i', ru: 'Яблоневый сад' },
    plantMonth: 2,
    stages: [
      { key: 'initial', days: 30, kc: 0.5 },
      { key: 'development', days: 60, kc: 0.75 },
      { key: 'mid', days: 90, kc: 0.95 },
      { key: 'late', days: 45, kc: 0.7 },
    ],
    interval: std([16, 12, 10, 16], [12, 9, 7, 12], [4, 3, 2, 4]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Gullashgacha azot — kuchli o‘sish uchun', ru: 'До цветения азот — для сильного роста' } },
      { stage: 'development', text: { uz: 'Tuguncha davrida kompleks NPK', ru: 'В период завязи — комплексное NPK' } },
      { stage: 'mid', text: { uz: 'Meva to‘lishida kaliy va kaltsiy', ru: 'При наливе плодов калий и кальций' } },
      { stage: 'late', text: { uz: 'Kuzda organik o‘g‘it soling', ru: 'Осенью внесите органику' } },
    ],
  },
  {
    id: 'melon',
    emoji: '🍈',
    icon: 'melon',
    rootDepth: { start: 0.3, max: 0.9 },
    depletion: 0.45,
    name: { uz: 'Qovun-tarvuz', ru: 'Дыни и арбузы' },
    plantMonth: 4,
    stages: [
      { key: 'initial', days: 25, kc: 0.4 },
      { key: 'development', days: 35, kc: 0.75 },
      { key: 'mid', days: 40, kc: 1.0 },
      { key: 'late', days: 20, kc: 0.7 },
    ],
    interval: std([10, 8, 7, 12], [8, 6, 5, 9], [3, 2, 2, 4]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Unishda ozgina azot yetarli', ru: 'На всходах достаточно немного азота' } },
      { stage: 'development', text: { uz: 'Palak otishda fosfor bering', ru: 'При образовании плетей — фосфор' } },
      { stage: 'mid', text: { uz: 'Meva to‘lishida faqat kaliy', ru: 'При наливе плодов только калий' } },
      { stage: 'late', text: { uz: 'Pishishdan 2 hafta oldin sug‘orishni kamaytiring — shirinlik oshadi', ru: 'За 2 недели до созревания сократите полив — плоды будут слаще' } },
    ],
  },
  {
    id: 'potato',
    emoji: '🥔',
    icon: 'potato',
    rootDepth: { start: 0.25, max: 0.5 },
    depletion: 0.35,
    name: { uz: 'Kartoshka', ru: 'Картофель' },
    plantMonth: 2,
    stages: [
      { key: 'initial', days: 25, kc: 0.5 },
      { key: 'development', days: 30, kc: 0.8 },
      { key: 'mid', days: 45, kc: 1.15 },
      { key: 'late', days: 30, kc: 0.75 },
    ],
    interval: std([10, 8, 6, 10], [7, 6, 4, 7], [3, 2, 1, 3]),
    fertilizer: [
      { stage: 'initial', text: { uz: 'Ekishda NPK kompleksi', ru: 'При посадке — комплекс NPK' } },
      { stage: 'development', text: { uz: 'G‘umbaklashda azot + kaliy', ru: 'При окучивании азот + калий' } },
      { stage: 'mid', text: { uz: 'Tugunak hosil bo‘lishida kaliy muhim', ru: 'При клубнеобразовании важен калий' } },
      { stage: 'late', text: { uz: 'Hosildan 2 hafta oldin sug‘orishni to‘xtating', ru: 'За 2 недели до уборки прекратите полив' } },
    ],
  },
];

export const methodEfficiency = { furrow: 0.5, sprinkler: 0.75, drip: 0.9 } as const;
export type Method = keyof typeof methodEfficiency;
