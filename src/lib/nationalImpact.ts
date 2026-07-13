// Fetches the anonymous national aggregate (total water saved + per-region
// breakdown) from the Netlify function. Best-effort: returns null on failure so
// the UI can hide the section gracefully.
const base = (import.meta.env.VITE_AI_URL as string | undefined) ?? '/.netlify/functions';

export interface NationalImpact {
  totalSaved: number;
  totalMoney: number;
  totalUsed: number;
  fieldCount: number;
  regionCount: number;
  pools: number;
  byRegion: Record<string, { saved: number; count: number }>;
}

export async function fetchNationalImpact(): Promise<NationalImpact | null> {
  try {
    const res = await fetch(`${base}/impact`);
    if (!res.ok) return null;
    return (await res.json()) as NationalImpact;
  } catch {
    return null;
  }
}
