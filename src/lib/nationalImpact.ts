// Fetches the anonymous national aggregate (total water saved, per-region
// breakdown, and a top-savers leaderboard) from the Netlify function.
// Best-effort: returns null on failure so the UI can hide the section.
import { ensureSession } from './supabase';

const base = (import.meta.env.VITE_AI_URL as string | undefined) ?? '/.netlify/functions';

export interface TopEntry {
  regionId: string;
  cropId: string;
  saved: number;
  you: boolean;
}

export interface NationalImpact {
  totalSaved: number;
  totalMoney: number;
  totalUsed: number;
  fieldCount: number;
  regionCount: number;
  pools: number;
  byRegion: Record<string, { saved: number; count: number }>;
  top: TopEntry[];
}

export async function fetchNationalImpact(): Promise<NationalImpact | null> {
  try {
    // Pass our anon owner id so the leaderboard can mark our own field(s).
    let me = '';
    try {
      const user = await ensureSession();
      if (user) me = `?me=${encodeURIComponent(user.id)}`;
    } catch { /* backend off — fine */ }
    const res = await fetch(`${base}/impact${me}`);
    if (!res.ok) return null;
    return (await res.json()) as NationalImpact;
  } catch {
    return null;
  }
}
