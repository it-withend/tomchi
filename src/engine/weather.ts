// Live weather from Open-Meteo (free, no API key). Gives real FAO-56 reference
// evapotranspiration and rain forecast so irrigation advice reacts to today's
// weather instead of long-term climate normals. Falls back silently offline.
import { getRegion } from './irrigation';

export interface WeatherDay {
  date: string; // YYYY-MM-DD
  et0: number; // mm/day (FAO-56)
  rainMm: number;
  rainProb: number; // %
  tMax: number;
  tMin: number;
}

export interface Forecast {
  fetchedAt: number;
  regionId: string;
  days: WeatherDay[];
}

const CACHE_PREFIX = 'tomchi.wx.';
const TTL = 6 * 60 * 60 * 1000; // 6h

function cacheKey(regionId: string) {
  return CACHE_PREFIX + regionId;
}

export function getCachedForecast(regionId: string): Forecast | null {
  try {
    const raw = localStorage.getItem(cacheKey(regionId));
    if (!raw) return null;
    const f = JSON.parse(raw) as Forecast;
    return f;
  } catch {
    return null;
  }
}

export async function fetchForecast(regionId: string): Promise<Forecast | null> {
  const region = getRegion(regionId);
  const cached = getCachedForecast(regionId);
  if (cached && Date.now() - cached.fetchedAt < TTL) return cached;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lon}` +
    `&daily=et0_fao_evapotranspiration,precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(url);
    if (!res.ok) return cached;
    const j = await res.json();
    const d = j.daily;
    const days: WeatherDay[] = d.time.map((date: string, i: number) => ({
      date,
      et0: d.et0_fao_evapotranspiration[i] ?? 0,
      rainMm: d.precipitation_sum[i] ?? 0,
      rainProb: d.precipitation_probability_max[i] ?? 0,
      tMax: d.temperature_2m_max[i] ?? 0,
      tMin: d.temperature_2m_min[i] ?? 0,
    }));
    const forecast: Forecast = { fetchedAt: Date.now(), regionId, days };
    try { localStorage.setItem(cacheKey(regionId), JSON.stringify(forecast)); } catch { /* quota */ }
    return forecast;
  } catch {
    return cached; // offline — use last known if any
  }
}

export function dayFrom(forecast: Forecast | null, date = new Date()): WeatherDay | null {
  if (!forecast) return null;
  const iso = date.toISOString().slice(0, 10);
  return forecast.days.find((d) => d.date === iso) ?? null;
}

/** Significant rain that should postpone irrigation. */
export const RAIN_SKIP_MM = 5;

export function nextRainDay(forecast: Forecast | null): WeatherDay | null {
  if (!forecast) return null;
  const todayIso = new Date().toISOString().slice(0, 10);
  return forecast.days.find((d) => d.date >= todayIso && d.rainMm >= RAIN_SKIP_MM) ?? null;
}
