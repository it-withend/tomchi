import type { Lang } from '../i18n';

// Monthly reference evapotranspiration ET0 (mm/day), Jan..Dec.
// Approximated from FAO CLIMWAT / UzHydromet climate normals for each region's
// agro-climatic zone (hot arid south > temperate valleys > Aral zone winds).
export interface Region {
  id: string;
  name: { uz: string; ru: string };
  et0: number[]; // 12 values, mm/day
  lat: number;
  lon: number;
}

export const regions: Region[] = [
  { id: 'tashkent',    name: { uz: 'Toshkent viloyati', ru: 'Ташкентская область' },    lat: 41.31, lon: 69.28, et0: [0.9, 1.4, 2.5, 4.0, 5.6, 7.0, 7.3, 6.5, 4.6, 2.8, 1.5, 0.9] },
  { id: 'andijan',     name: { uz: 'Andijon', ru: 'Андижан' },                          lat: 40.78, lon: 72.34, et0: [0.8, 1.3, 2.4, 3.9, 5.4, 6.7, 7.0, 6.3, 4.4, 2.6, 1.4, 0.8] },
  { id: 'fergana',     name: { uz: 'Farg‘ona', ru: 'Фергана' },                         lat: 40.39, lon: 71.78, et0: [0.8, 1.3, 2.4, 3.9, 5.5, 6.8, 7.1, 6.4, 4.5, 2.7, 1.4, 0.8] },
  { id: 'namangan',    name: { uz: 'Namangan', ru: 'Наманган' },                        lat: 40.99, lon: 71.67, et0: [0.8, 1.3, 2.4, 3.8, 5.4, 6.7, 7.0, 6.3, 4.4, 2.6, 1.4, 0.8] },
  { id: 'samarkand',   name: { uz: 'Samarqand', ru: 'Самарканд' },                      lat: 39.65, lon: 66.96, et0: [1.0, 1.5, 2.6, 4.1, 5.7, 7.1, 7.4, 6.6, 4.7, 2.9, 1.6, 1.0] },
  { id: 'bukhara',     name: { uz: 'Buxoro', ru: 'Бухара' },                            lat: 39.77, lon: 64.42, et0: [1.0, 1.6, 2.9, 4.6, 6.4, 7.9, 8.2, 7.3, 5.2, 3.1, 1.7, 1.0] },
  { id: 'navoi',       name: { uz: 'Navoiy', ru: 'Навои' },                             lat: 40.10, lon: 65.38, et0: [1.0, 1.6, 2.9, 4.6, 6.4, 7.9, 8.2, 7.3, 5.2, 3.1, 1.7, 1.0] },
  { id: 'kashkadarya', name: { uz: 'Qashqadaryo', ru: 'Кашкадарья' },                   lat: 38.86, lon: 65.79, et0: [1.1, 1.7, 3.0, 4.7, 6.5, 8.0, 8.3, 7.4, 5.3, 3.2, 1.8, 1.1] },
  { id: 'surkhandarya',name: { uz: 'Surxondaryo', ru: 'Сурхандарья' },                  lat: 37.94, lon: 67.57, et0: [1.2, 1.8, 3.1, 4.8, 6.7, 8.2, 8.5, 7.6, 5.5, 3.3, 1.9, 1.2] },
  { id: 'jizzakh',     name: { uz: 'Jizzax', ru: 'Джизак' },                            lat: 40.12, lon: 67.84, et0: [1.0, 1.5, 2.7, 4.3, 5.9, 7.3, 7.6, 6.8, 4.8, 2.9, 1.6, 1.0] },
  { id: 'syrdarya',    name: { uz: 'Sirdaryo', ru: 'Сырдарья' },                        lat: 40.48, lon: 68.79, et0: [0.9, 1.4, 2.6, 4.2, 5.8, 7.2, 7.5, 6.7, 4.7, 2.8, 1.5, 0.9] },
  { id: 'khorezm',     name: { uz: 'Xorazm', ru: 'Хорезм' },                            lat: 41.55, lon: 60.63, et0: [0.8, 1.4, 2.7, 4.4, 6.2, 7.7, 8.0, 7.0, 4.9, 2.9, 1.5, 0.8] },
  { id: 'karakalpak',  name: { uz: 'Qoraqalpog‘iston', ru: 'Каракалпакстан' },          lat: 42.46, lon: 59.61, et0: [0.7, 1.3, 2.6, 4.3, 6.1, 7.6, 7.9, 6.9, 4.8, 2.8, 1.4, 0.7] },
  { id: 'tashkent_city', name: { uz: 'Toshkent shahri', ru: 'г. Ташкент' },             lat: 41.31, lon: 69.24, et0: [0.9, 1.4, 2.5, 4.0, 5.6, 7.0, 7.3, 6.5, 4.6, 2.8, 1.5, 0.9] },
];

export function regionName(r: Region, lang: Lang) {
  return r.name[lang];
}
