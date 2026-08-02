// The one seam between the interface and the thing that opens the valve.
//
// Today every call below writes to Supabase and a scheduled function closes the
// session out — a virtual controller. When real hardware arrives, only the
// bodies of these functions change; no component that renders a gauge, a button
// or a progress bar has to be touched.
//
// Like lib/sync.ts, nothing here throws: with no backend configured, or with the
// network down, calls return null or an empty list and the UI explains itself.
import { supabase, ensureSession } from './supabase';
import { methodEfficiency, type Method } from '../data/crops';

export interface Device {
  id: string;
  fieldId: string;
  kind: 'virtual';
  flowLpm: number;
  status: 'online' | 'offline';
}

export type SessionStatus = 'running' | 'done' | 'stopped' | 'failed';

export interface Session {
  id: string;
  startedAt: string;
  plannedEndAt: string;
  plannedLiters: number;
  status: SessionStatus;
  source: 'manual' | 'auto' | 'bot';
  endedAt?: string;
  deliveredLiters?: number;
}

export interface SessionProgress {
  session: Session;
  /** 0..1 */
  fraction: number;
  deliveredLiters: number;
  minutesLeft: number;
}

/**
 * A valve left open is expensive and can waterlog a field, so no single session
 * may run longer than this however large the requested volume.
 */
export const MAX_SESSION_MINUTES = 8 * 60;

/**
 * Below this share of the planned volume a stopped session is treated as a
 * false start and leaves no journal entry — otherwise a mistaken tap would
 * distort the water-use record.
 */
const MIN_LOGGED_FRACTION = 0.2;

/**
 * Rough delivery rate per hectare by irrigation method, litres per minute.
 * Only a starting point: the farmer edits it to match their own pump, and the
 * number drives how long a valve stays open, so it should be corrected once.
 */
const FLOW_LPM_PER_HA: Record<Method, number> = {
  furrow: 500,
  sprinkler: 250,
  drip: 135,
};

export function suggestedFlowLpm(method: Method, areaHa: number): number {
  return Math.max(1, Math.round(FLOW_LPM_PER_HA[method] * Math.max(0.1, areaHa)));
}

/** Minutes a volume takes at a given flow, capped at the safety limit. */
export function plannedMinutes(liters: number, flowLpm: number): number {
  const raw = liters / Math.max(1, flowLpm);
  return Math.max(1, Math.min(MAX_SESSION_MINUTES, Math.round(raw)));
}

/** True when the requested volume cannot be delivered inside one session. */
export function exceedsSessionLimit(liters: number, flowLpm: number): boolean {
  return liters / Math.max(1, flowLpm) > MAX_SESSION_MINUTES;
}

/** Live progress of a session, derived purely from its timestamps. */
export function progressOf(session: Session, flowLpm: number, now = Date.now()): SessionProgress {
  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.plannedEndAt).getTime();
  const span = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(span, now - start));
  const fraction = elapsed / span;
  return {
    session,
    fraction,
    deliveredLiters: Math.min(session.plannedLiters, (elapsed / 60000) * flowLpm),
    minutesLeft: Math.max(0, Math.ceil((end - now) / 60000)),
  };
}

/** Gross volume in litres needed to refill the root zone, for a field. */
export function litersForDeficit(netMm: number, method: Method, areaHa: number): number {
  return (netMm / methodEfficiency[method]) * 10000 * areaHa;
}

type DeviceRow = { id: string; client_field_id: string; kind: string; flow_lpm: number; status: string };
type SessionRow = {
  id: string; started_at: string; planned_end_at: string; planned_liters: number;
  status: SessionStatus; source: string; ended_at: string | null; delivered_liters: number | null;
};

const toDevice = (r: DeviceRow): Device => ({
  id: r.id,
  fieldId: r.client_field_id,
  kind: 'virtual',
  flowLpm: Number(r.flow_lpm),
  status: r.status === 'offline' ? 'offline' : 'online',
});

const toSession = (r: SessionRow): Session => ({
  id: r.id,
  startedAt: r.started_at,
  plannedEndAt: r.planned_end_at,
  plannedLiters: Number(r.planned_liters),
  status: r.status,
  source: (r.source as Session['source']) ?? 'manual',
  endedAt: r.ended_at ?? undefined,
  deliveredLiters: r.delivered_liters == null ? undefined : Number(r.delivered_liters),
});

export async function getDevice(fieldId: string): Promise<Device | null> {
  const user = await ensureSession();
  if (!user || !supabase) return null;
  const { data, error } = await supabase
    .from('devices')
    .select('id, client_field_id, kind, flow_lpm, status')
    .eq('owner', user.id)
    .eq('client_field_id', fieldId)
    .maybeSingle();
  if (error || !data) return null;
  return toDevice(data as DeviceRow);
}

export async function connectDevice(fieldId: string, flowLpm: number): Promise<Device | null> {
  const user = await ensureSession();
  if (!user || !supabase) return null;
  const { data, error } = await supabase
    .from('devices')
    .upsert(
      { owner: user.id, client_field_id: fieldId, kind: 'virtual', flow_lpm: flowLpm, last_seen: new Date().toISOString() },
      { onConflict: 'owner,client_field_id' },
    )
    .select('id, client_field_id, kind, flow_lpm, status')
    .maybeSingle();
  if (error || !data) { console.warn('Tomchi device connect:', error?.message); return null; }
  return toDevice(data as DeviceRow);
}

export async function updateFlow(fieldId: string, flowLpm: number): Promise<void> {
  const user = await ensureSession();
  if (!user || !supabase) return;
  const { error } = await supabase
    .from('devices')
    .update({ flow_lpm: flowLpm })
    .eq('owner', user.id)
    .eq('client_field_id', fieldId);
  if (error) console.warn('Tomchi device flow:', error.message);
}

export async function disconnectDevice(fieldId: string): Promise<void> {
  const user = await ensureSession();
  if (!user || !supabase) return;
  await supabase.from('devices').delete().eq('owner', user.id).eq('client_field_id', fieldId);
}

/** The session currently running on this field, with live progress. */
export async function getActiveSession(fieldId: string, flowLpm: number): Promise<SessionProgress | null> {
  const user = await ensureSession();
  if (!user || !supabase) return null;
  const { data, error } = await supabase
    .from('irrigation_sessions')
    .select('id, started_at, planned_end_at, planned_liters, status, source, ended_at, delivered_liters')
    .eq('owner', user.id)
    .eq('client_field_id', fieldId)
    .eq('status', 'running')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return progressOf(toSession(data as SessionRow), flowLpm);
}

/**
 * Opens the valve. Refuses if a session is already running on this field, so a
 * double tap or a second phone cannot start two waterings at once.
 */
export async function startIrrigation(
  fieldId: string,
  liters: number,
  flowLpm: number,
): Promise<Session | null> {
  const user = await ensureSession();
  if (!user || !supabase) return null;

  const running = await getActiveSession(fieldId, flowLpm);
  if (running) return null;

  const device = await getDevice(fieldId);
  if (!device) return null;

  const minutes = plannedMinutes(liters, flowLpm);
  const startedAt = new Date();
  const plannedEndAt = new Date(startedAt.getTime() + minutes * 60000);
  // Cap the recorded volume too, so a clipped session never claims to have
  // delivered more than its runtime allows.
  const plannedLiters = Math.min(liters, minutes * flowLpm);

  const { data, error } = await supabase
    .from('irrigation_sessions')
    .insert({
      owner: user.id,
      device_id: device.id,
      client_field_id: fieldId,
      started_at: startedAt.toISOString(),
      planned_end_at: plannedEndAt.toISOString(),
      planned_liters: plannedLiters,
      source: 'manual',
    })
    .select('id, started_at, planned_end_at, planned_liters, status, source, ended_at, delivered_liters')
    .maybeSingle();
  if (error || !data) { console.warn('Tomchi irrigation start:', error?.message); return null; }
  return toSession(data as SessionRow);
}

/**
 * Closes the valve early. Records what actually went out, and writes a journal
 * entry only if enough water was delivered to count as a watering.
 */
export async function stopIrrigation(
  session: Session,
  fieldId: string,
  flowLpm: number,
): Promise<void> {
  const user = await ensureSession();
  if (!user || !supabase) return;

  const now = new Date();
  const { deliveredLiters } = progressOf(session, flowLpm, now.getTime());

  const { error } = await supabase
    .from('irrigation_sessions')
    .update({
      status: 'stopped',
      ended_at: now.toISOString(),
      delivered_liters: deliveredLiters,
      notified: true, // the farmer stopped it themselves; no push needed
    })
    .eq('id', session.id)
    .eq('owner', user.id);
  if (error) { console.warn('Tomchi irrigation stop:', error.message); return; }

  if (deliveredLiters >= session.plannedLiters * MIN_LOGGED_FRACTION) {
    await supabase.from('watering_events').insert({
      owner: user.id,
      client_field_id: fieldId,
      type: 'watered',
      at: session.startedAt,
    });
  }
}

export async function listSessions(fieldId: string, limit = 8): Promise<Session[]> {
  const user = await ensureSession();
  if (!user || !supabase) return [];
  const { data, error } = await supabase
    .from('irrigation_sessions')
    .select('id, started_at, planned_end_at, planned_liters, status, source, ended_at, delivered_liters')
    .eq('owner', user.id)
    .eq('client_field_id', fieldId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as SessionRow[]).map(toSession);
}
