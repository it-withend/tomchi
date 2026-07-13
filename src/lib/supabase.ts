import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

// Backend is optional: the app works fully on localStorage. When these env vars
// are set (see .env.example) it also syncs to Supabase so the Telegram bot and
// AI doctor can work. Both keys are public/anon — safe to ship in the client.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
    : null;

export const supabaseEnabled = !!supabase;
export const functionsUrl = url ? `${url}/functions/v1` : null;
export const anonKey = anon ?? null;

let sessionPromise: Promise<User | null> | null = null;

/** Anonymous sign-in so every device gets a stable owner id for RLS. */
export function ensureSession(): Promise<User | null> {
  if (!supabase) return Promise.resolve(null);
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) return data.session.user;
      const { data: anonData, error } = await supabase.auth.signInAnonymously();
      if (error) { console.warn('Tomchi: anonymous sign-in failed —', error.message); return null; }
      return anonData.user ?? null;
    })();
  }
  return sessionPromise;
}
