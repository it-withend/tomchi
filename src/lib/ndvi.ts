// Client wrapper for the satellite field-health (NDVI) function. Results are
// cached per field in localStorage for a day — a Sentinel-2 scene only refreshes
// every ~5 days, so there's no point re-billing processing units on each visit.
const base = (import.meta.env.VITE_AI_URL as string | undefined) ?? '/.netlify/functions';

export interface Ndvi {
  ok: boolean;
  img: string | null; // data URL of the coloured NDVI plot
  meanNdvi: number | null;
  health: number | null; // 0..100
  status: 'healthy' | 'moderate' | 'stressed' | 'nodata';
  date: string | null; // YYYY-MM-DD of the scene
}

const DAY = 86_400_000;
const cacheKey = (id: string) => `tomchi.ndvi.${id}`;

function readCache(id: string, lat: number, lng: number): Ndvi | null {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    if (!raw) return null;
    const c = JSON.parse(raw);
    // Bust the cache if the plot moved or the entry is stale.
    if (c.lat !== round(lat) || c.lng !== round(lng) || Date.now() - c.at > DAY) return null;
    return c.data as Ndvi;
  } catch { return null; }
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

export async function fetchNdvi(id: string, lat: number, lng: number, ha: number): Promise<Ndvi | null> {
  const cached = readCache(id, lat, lng);
  if (cached) return cached;
  try {
    const res = await fetch(`${base}/ndvi?lat=${lat}&lng=${lng}&ha=${ha}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Ndvi;
    if (!data.ok) return null;
    try {
      localStorage.setItem(cacheKey(id), JSON.stringify({ lat: round(lat), lng: round(lng), at: Date.now(), data }));
    } catch { /* quota — fine, just skip caching */ }
    return data;
  } catch {
    return null;
  }
}
