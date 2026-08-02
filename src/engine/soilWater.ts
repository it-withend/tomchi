// FAO-56 root-zone water balance.
//
// This is what lets Tomchi answer "how wet is the soil right now" without a
// physical sensor. It is the same bookkeeping a moisture probe would confirm:
// the root zone is a bucket of size TAW, irrigation and rain fill it, crop
// evapotranspiration empties it, and the crop suffers once more than RAW is
// gone. When a real sensor arrives it replaces the computed depletion and every
// other rule here stays as it is.
//
// Pure functions only — no network, no storage. Works offline.
import { getCrop, getRegion, daysIntoSeason, stageAt, seasonLength, et0At, lastEventDate, type FieldConfig, type Soil } from './irrigation';
import { methodEfficiency, type Crop } from '../data/crops';
import type { Forecast } from './weather';

/**
 * Water a soil can hold between field capacity and wilting point, in mm per
 * metre of root zone (FAO-56 Table 19, midpoint of each texture's range).
 */
export const availableWaterPerMetre: Record<Soil, number> = {
  sandy: 80,
  loam: 160,
  clay: 150,
};

const MM_PER_HA_TO_M3 = 10; // 1 mm over 1 ha = 10 m³
const PROJECTION_LIMIT_DAYS = 30;

export interface SoilWater {
  inSeason: boolean;
  /** Total available water in the root zone, mm. */
  taw: number;
  /** Readily available water — depletion beyond this stresses the crop, mm. */
  raw: number;
  /** Current root-zone depletion, mm. 0 means field capacity. */
  depletion: number;
  /** 100 = field capacity, 0 = wilting point. */
  moisturePct: number;
  rootDepth: number;
  needsIrrigation: boolean;
  /** Net depth needed to refill to field capacity, mm. */
  netMm: number;
  /** Gross volume for the whole field once method losses are added, m³. */
  grossM3: number;
  /** Days until depletion reaches RAW, or null if not within a month. */
  daysUntilIrrigation: number | null;
}

/**
 * Roots deepen from planting until the crop is fully developed (the start of the
 * mid stage), then hold. Linear is a deliberate simplification: the error it
 * introduces is far smaller than the spread in the FAO depth ranges themselves.
 */
export function rootDepthAt(crop: Crop, daysIn: number): number {
  const { start, max } = crop.rootDepth;
  let toFullCover = 0;
  for (const st of crop.stages) {
    if (st.key === 'mid') break;
    toFullCover += st.days;
  }
  if (toFullCover <= 0) return max;
  const progress = Math.min(1, Math.max(0, daysIn / toFullCover));
  return start + (max - start) * progress;
}

/**
 * FAO-56 eq. 83: crops tolerate less depletion on days when they transpire hard,
 * so the stress threshold tightens as ETc rises.
 */
export function adjustedDepletionFraction(p: number, etcMmPerDay: number): number {
  return Math.min(0.8, Math.max(0.1, p + 0.04 * (5 - etcMmPerDay)));
}

/** ETc for a given date, preferring measured ET0 from the forecast cache. */
function etcOn(field: FieldConfig, crop: Crop, date: Date, forecast: Forecast | null): number {
  const daysIn = daysIntoSeason(crop, date);
  if (daysIn < 0) return 0;
  const { kc } = stageAt(crop, daysIn);
  const iso = date.toISOString().slice(0, 10);
  const measured = forecast?.days.find((d) => d.date === iso);
  const et0 = measured && measured.et0 > 0 ? measured.et0 : et0At(getRegion(field.regionId), date);
  return et0 * kc;
}

/** Rain in mm on a date, from the forecast cache; 0 when we have no reading. */
function rainOn(date: Date, forecast: Forecast | null): number {
  const iso = date.toISOString().slice(0, 10);
  return forecast?.days.find((d) => d.date === iso)?.rainMm ?? 0;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Root-zone water balance for a field.
 *
 * The tally starts at the last journal entry — a watering or a logged rain —
 * which is taken to have refilled the root zone, and then subtracts each day's
 * ETc and adds any rain the forecast cache knows about. Past rainfall is only as
 * good as the journal, because the weather API is only asked for the days ahead;
 * a real gauge or `past_days` would sharpen this.
 */
export function soilWater(field: FieldConfig, forecast: Forecast | null, date = new Date()): SoilWater {
  const crop = getCrop(field.cropId);
  const daysIn = daysIntoSeason(crop, date);
  const empty: SoilWater = {
    inSeason: false, taw: 0, raw: 0, depletion: 0, moisturePct: 100,
    rootDepth: 0, needsIrrigation: false, netMm: 0, grossM3: 0, daysUntilIrrigation: null,
  };
  if (daysIn < 0) return empty;

  const rootDepth = rootDepthAt(crop, daysIn);
  const taw = availableWaterPerMetre[field.soil] * rootDepth;
  if (taw <= 0) return empty;

  // Walk forward from the last refill. With no journal at all, assume the season
  // opened at field capacity and count from planting.
  const today = startOfDay(date);
  const last = lastEventDate(field);
  const seasonStart = new Date(date.getFullYear(), crop.plantMonth, 1);
  const from = startOfDay(last ? new Date(last) : seasonStart);
  const days = Math.min(
    seasonLength(crop),
    Math.max(0, Math.round((today.getTime() - from.getTime()) / 86400000)),
  );

  let depletion = 0;
  for (let i = 1; i <= days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    depletion = Math.min(taw, Math.max(0, depletion + etcOn(field, crop, d, forecast) - rainOn(d, forecast)));
  }

  const etcToday = etcOn(field, crop, today, forecast);
  const raw = adjustedDepletionFraction(crop.depletion, etcToday) * taw;
  const netMm = depletion;
  const grossM3 = (netMm / methodEfficiency[field.method]) * MM_PER_HA_TO_M3 * field.areaHa;

  // Project forward at the coming days' ETc to say when the bucket runs dry.
  let daysUntilIrrigation: number | null = null;
  if (depletion >= raw) {
    daysUntilIrrigation = 0;
  } else {
    let ahead = depletion;
    for (let i = 1; i <= PROJECTION_LIMIT_DAYS; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      ahead = Math.min(taw, Math.max(0, ahead + etcOn(field, crop, d, forecast) - rainOn(d, forecast)));
      if (ahead >= raw) { daysUntilIrrigation = i; break; }
    }
  }

  return {
    inSeason: true,
    taw,
    raw,
    depletion,
    moisturePct: Math.round(100 * (1 - depletion / taw)),
    rootDepth,
    needsIrrigation: depletion >= raw,
    netMm,
    grossM3,
    daysUntilIrrigation,
  };
}
