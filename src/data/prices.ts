// Indicative farm-gate market prices for Uzbekistan crops (so'm per kg) and a
// simple "when to sell" hint based on the typical harvest-glut / off-season
// price cycle. These are reference figures meant to be reviewed each season —
// not a live feed. Update `UPDATED` when you refresh them.
export const PRICE_UPDATED = '2026-07';

export interface CropPrice {
  cropId: string;
  low: number;   // so'm / kg
  high: number;
  trend: 'up' | 'down' | 'flat';
  harvest: number[];       // 0-based months of main harvest (glut = low prices)
  sell: { uz: string; ru: string }; // when-to-sell advice
}

export const cropPrices: CropPrice[] = [
  { cropId: 'cotton', low: 5500, high: 7000, trend: 'flat', harvest: [8, 9, 10],
    sell: { uz: 'Davlat xaridi narxida — sifat (klass) muhim.', ru: 'Идёт по госзакупке — важен класс (качество) хлопка.' } },
  { cropId: 'wheat', low: 3200, high: 4200, trend: 'up', harvest: [5, 6],
    sell: { uz: 'Hosil paytida narx past. Saqlab, kuz-qishda soting.', ru: 'В уборку цена низкая. Храните и продавайте осенью-зимой.' } },
  { cropId: 'tomato', low: 3500, high: 9000, trend: 'up', harvest: [6, 7, 8],
    sell: { uz: 'Yozda arzon. Erta yoki kech hosil — 2-3 barobar qimmat.', ru: 'Летом дёшево. Ранний или поздний урожай — в 2-3 раза дороже.' } },
  { cropId: 'grapes', low: 7000, high: 16000, trend: 'up', harvest: [7, 8, 9],
    sell: { uz: 'Quritib (mayiz) yoki kech navlarda narx yuqori.', ru: 'Сушка (изюм) или поздние сорта — цена выше.' } },
  { cropId: 'apple', low: 5000, high: 11000, trend: 'flat', harvest: [8, 9, 10],
    sell: { uz: 'Sovutgichda saqlab, qish-bahorda soting.', ru: 'Храните в холодильнике, продавайте зимой-весной.' } },
  { cropId: 'melon', low: 2500, high: 6000, trend: 'flat', harvest: [6, 7, 8],
    sell: { uz: 'Erta yetiltirilgan qovun-tarvuz qimmat.', ru: 'Ранние дыни-арбузы стоят дороже.' } },
  { cropId: 'potato', low: 3500, high: 6500, trend: 'up', harvest: [5, 6, 8, 9],
    sell: { uz: 'Saqlashga chidamli — narx ko‘tarilganda soting.', ru: 'Хорошо хранится — продавайте, когда цена растёт.' } },
];

export const getPrice = (cropId: string) => cropPrices.find((p) => p.cropId === cropId);
