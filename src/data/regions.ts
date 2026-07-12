import type { Lang } from '../i18n';

// Monthly reference evapotranspiration ET0 (mm/day), Jan..Dec.
// Approximated from FAO CLIMWAT / UzHydromet climate normals for each region's
// agro-climatic zone (hot arid south > temperate valleys > Aral zone winds).
export interface Region {
  id: string;
  name: { uz: string; ru: string };
  et0: number[]; // 12 values, mm/day
}

export const regions: Region[] = [
  { id: 'tashkent',    name: { uz: 'Toshkent viloyati', ru: 'Ташкентская область' },    et0: [0.9, 1.4, 2.5, 4.0, 5.6, 7.0, 7.3, 6.5, 4.6, 2.8, 1.5, 0.9] },
  { id: 'andijan',     name: { uz: 'Andijon', ru: 'Андижан' },                          et0: [0.8, 1.3, 2.4, 3.9, 5.4, 6.7, 7.0, 6.3, 4.4, 2.6, 1.4, 0.8] },
  { id: 'fergana',     name: { uz: 'Farg‘ona', ru: 'Фергана' },                         et0: [0.8, 1.3, 2.4, 3.9, 5.5, 6.8, 7.1, 6.4, 4.5, 2.7, 1.4, 0.8] },
  { id: 'namangan',    name: { uz: 'Namangan', ru: 'Наманган' },                        et0: [0.8, 1.3, 2.4, 3.8, 5.4, 6.7, 7.0, 6.3, 4.4, 2.6, 1.4, 0.8] },
  { id: 'samarkand',   name: { uz: 'Samarqand', ru: 'Самарканд' },                      et0: [1.0, 1.5, 2.6, 4.1, 5.7, 7.1, 7.4, 6.6, 4.7, 2.9, 1.6, 1.0] },
  { id: 'bukhara',     name: { uz: 'Buxoro', ru: 'Бухара' },                            et0: [1.0, 1.6, 2.9, 4.6, 6.4, 7.9, 8.2, 7.3, 5.2, 3.1, 1.7, 1.0] },
  { id: 'navoi',       name: { uz: 'Navoiy', ru: 'Навои' },                             et0: [1.0, 1.6, 2.9, 4.6, 6.4, 7.9, 8.2, 7.3, 5.2, 3.1, 1.7, 1.0] },
  { id: 'kashkadarya', name: { uz: 'Qashqadaryo', ru: 'Кашкадарья' },                   et0: [1.1, 1.7, 3.0, 4.7, 6.5, 8.0, 8.3, 7.4, 5.3, 3.2, 1.8, 1.1] },
  { id: 'surkhandarya',name: { uz: 'Surxondaryo', ru: 'Сурхандарья' },                  et0: [1.2, 1.8, 3.1, 4.8, 6.7, 8.2, 8.5, 7.6, 5.5, 3.3, 1.9, 1.2] },
  { id: 'jizzakh',     name: { uz: 'Jizzax', ru: 'Джизак' },                            et0: [1.0, 1.5, 2.7, 4.3, 5.9, 7.3, 7.6, 6.8, 4.8, 2.9, 1.6, 1.0] },
  { id: 'syrdarya',    name: { uz: 'Sirdaryo', ru: 'Сырдарья' },                        et0: [0.9, 1.4, 2.6, 4.2, 5.8, 7.2, 7.5, 6.7, 4.7, 2.8, 1.5, 0.9] },
  { id: 'khorezm',     name: { uz: 'Xorazm', ru: 'Хорезм' },                            et0: [0.8, 1.4, 2.7, 4.4, 6.2, 7.7, 8.0, 7.0, 4.9, 2.9, 1.5, 0.8] },
  { id: 'karakalpak',  name: { uz: 'Qoraqalpog‘iston', ru: 'Каракалпакстан' },          et0: [0.7, 1.3, 2.6, 4.3, 6.1, 7.6, 7.9, 6.9, 4.8, 2.8, 1.4, 0.7] },
  { id: 'tashkent_city', name: { uz: 'Toshkent shahri', ru: 'г. Ташкент' },             et0: [0.9, 1.4, 2.5, 4.0, 5.6, 7.0, 7.3, 6.5, 4.6, 2.8, 1.5, 0.9] },
];

export function regionName(r: Region, lang: Lang) {
  return r.name[lang];
}
