import { regions, type Region } from '../data/regions';
import { crops, methodEfficiency, type Crop, type Method, type StageKey } from '../data/crops';

export interface FieldConfig {
  regionId: string;
  cropId: string;
  areaHa: number;
  method: Method;
}

export interface DayStatus {
  inSeason: boolean;
  stage: StageKey | 'off';
  kc: number;
  et0: number; // mm/day
  etc: number; // mm/day crop water need (net)
  grossMm: number; // mm/day accounting for method efficiency
  litersPerDay: number; // for whole field
  intervalDays: number;
  litersPerIrrigation: number;
  daysIntoSeason: number;
  seasonLength: number;
}

export function getRegion(id: string): Region {
  return regions.find((r) => r.id === id) ?? regions[0];
}
export function getCrop(id: string): Crop {
  return crops.find((c) => c.id === id) ?? crops[0];
}

/** Day-of-year helpers that tolerate seasons crossing the new year (winter wheat). */
function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function seasonLength(crop: Crop): number {
  return crop.stages.reduce((s, st) => s + st.days, 0);
}

/** Returns days elapsed since planting for the given date, or -1 if out of season. */
export function daysIntoSeason(crop: Crop, date: Date): number {
  const plantDoy = dayOfYear(new Date(date.getFullYear(), crop.plantMonth, 1));
  const doy = dayOfYear(date);
  const len = seasonLength(crop);
  let diff = doy - plantDoy;
  if (diff < 0) diff += 365; // season started previous calendar year
  return diff < len ? diff : -1;
}

export function stageAt(crop: Crop, daysIn: number): { key: StageKey; kc: number } {
  let acc = 0;
  for (const st of crop.stages) {
    acc += st.days;
    if (daysIn < acc) return { key: st.key, kc: st.kc };
  }
  const last = crop.stages[crop.stages.length - 1];
  return { key: last.key, kc: last.kc };
}

/** ET0 for an arbitrary date, linearly interpolated between month midpoints. */
export function et0At(region: Region, date: Date): number {
  const m = date.getMonth();
  const day = date.getDate();
  const dim = new Date(date.getFullYear(), m + 1, 0).getDate();
  const cur = region.et0[m];
  // interpolate toward neighbouring month depending on position in month
  if (day <= dim / 2) {
    const prev = region.et0[(m + 11) % 12];
    const f = (day + dim / 2) / dim; // 0.5..1 at mid
    return prev + (cur - prev) * f;
  } else {
    const next = region.et0[(m + 1) % 12];
    const f = (day - dim / 2) / dim;
    return cur + (next - cur) * f;
  }
}

const LITERS_PER_MM_HA = 10000; // 1 mm over 1 ha = 10 m3 = 10,000 L

export function dayStatus(cfg: FieldConfig, date = new Date()): DayStatus {
  const region = getRegion(cfg.regionId);
  const crop = getCrop(cfg.cropId);
  const daysIn = daysIntoSeason(crop, date);
  const len = seasonLength(crop);
  const et0 = et0At(region, date);

  if (daysIn < 0) {
    return {
      inSeason: false, stage: 'off', kc: 0, et0, etc: 0, grossMm: 0,
      litersPerDay: 0, intervalDays: 0, litersPerIrrigation: 0,
      daysIntoSeason: -1, seasonLength: len,
    };
  }

  const { key, kc } = stageAt(crop, daysIn);
  const etc = et0 * kc;
  const eff = methodEfficiency[cfg.method];
  const grossMm = etc / eff;
  const litersPerDay = grossMm * LITERS_PER_MM_HA * cfg.areaHa;
  const intervalDays = crop.interval[key][cfg.method];
  return {
    inSeason: true, stage: key, kc, et0, etc, grossMm,
    litersPerDay, intervalDays,
    litersPerIrrigation: litersPerDay * intervalDays,
    daysIntoSeason: daysIn, seasonLength: len,
  };
}

export interface MonthRow {
  month: number; // 0..11
  stage: StageKey | 'off';
  m3PerHa: number; // gross monthly need per hectare
  m3Field: number; // for the whole field
}

/** Seasonal calendar: monthly gross water need. */
export function seasonCalendar(cfg: FieldConfig, year = new Date().getFullYear()): MonthRow[] {
  const crop = getCrop(cfg.cropId);
  const region = getRegion(cfg.regionId);
  const eff = methodEfficiency[cfg.method];
  const rows: MonthRow[] = [];
  for (let m = 0; m < 12; m++) {
    const dim = new Date(year, m + 1, 0).getDate();
    let mm = 0;
    const stageCount: Partial<Record<StageKey, number>> = {};
    for (let d = 1; d <= dim; d++) {
      const date = new Date(year, m, d);
      const daysIn = daysIntoSeason(crop, date);
      if (daysIn < 0) continue;
      const { key, kc } = stageAt(crop, daysIn);
      mm += (region.et0[m] * kc) / eff;
      stageCount[key] = (stageCount[key] ?? 0) + 1;
    }
    let stage: StageKey | 'off' = 'off';
    let best = 0;
    (Object.keys(stageCount) as StageKey[]).forEach((k) => {
      if ((stageCount[k] ?? 0) > best) { best = stageCount[k]!; stage = k; }
    });
    const m3PerHa = mm * 10; // 1 mm/ha = 10 m3
    rows.push({ month: m, stage, m3PerHa, m3Field: m3PerHa * cfg.areaHa });
  }
  return rows;
}

export function seasonTotals(cfg: FieldConfig) {
  const cal = seasonCalendar(cfg);
  const m3Field = cal.reduce((s, r) => s + r.m3Field, 0);
  // baseline: same crop watered by furrow
  const baseCal = seasonCalendar({ ...cfg, method: 'furrow' });
  const m3Furrow = baseCal.reduce((s, r) => s + r.m3Field, 0);
  const dripCal = seasonCalendar({ ...cfg, method: 'drip' });
  const m3Drip = dripCal.reduce((s, r) => s + r.m3Field, 0);
  return { m3Field, m3Furrow, m3Drip, m3Saved: Math.max(0, m3Furrow - m3Field) };
}

// Approximate cost of delivered irrigation water (pumping + service), som/m3
export const SOM_PER_M3 = 250;
export const POOL_M3 = 2500; // olympic pool volume
