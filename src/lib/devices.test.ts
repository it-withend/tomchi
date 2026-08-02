import { describe, it, expect } from 'vitest';
import {
  plannedMinutes, exceedsSessionLimit, progressOf, suggestedFlowLpm,
  litersForDeficit, MAX_SESSION_MINUTES, type Session,
} from './devices';

const session = (over: Partial<Session> = {}): Session => ({
  id: 's1',
  startedAt: '2026-07-01T06:00:00.000Z',
  plannedEndAt: '2026-07-01T07:00:00.000Z',   // one hour
  plannedLiters: 6000,                         // at 100 l/min
  status: 'running',
  source: 'manual',
  ...over,
});

const at = (iso: string) => new Date(iso).getTime();

describe('suggestedFlowLpm', () => {
  it('scales with field size', () => {
    expect(suggestedFlowLpm('furrow', 2)).toBe(suggestedFlowLpm('furrow', 1) * 2);
  });

  it('ranks the methods by how much water they push', () => {
    expect(suggestedFlowLpm('drip', 1)).toBeLessThan(suggestedFlowLpm('sprinkler', 1));
    expect(suggestedFlowLpm('sprinkler', 1)).toBeLessThan(suggestedFlowLpm('furrow', 1));
  });

  it('never suggests a flow of zero for a tiny plot', () => {
    expect(suggestedFlowLpm('drip', 0)).toBeGreaterThan(0);
  });
});

describe('plannedMinutes', () => {
  it('divides volume by flow', () => {
    expect(plannedMinutes(6000, 100)).toBe(60);
  });

  it('never schedules a zero-length watering', () => {
    expect(plannedMinutes(1, 1000)).toBe(1);
  });

  it('refuses to hold the valve open past the safety limit', () => {
    expect(plannedMinutes(10_000_000, 100)).toBe(MAX_SESSION_MINUTES);
    expect(exceedsSessionLimit(10_000_000, 100)).toBe(true);
    expect(exceedsSessionLimit(6000, 100)).toBe(false);
  });
});

describe('progressOf', () => {
  it('is at the start before any time has passed', () => {
    const p = progressOf(session(), 100, at('2026-07-01T06:00:00Z'));
    expect(p.fraction).toBe(0);
    expect(p.deliveredLiters).toBe(0);
    expect(p.minutesLeft).toBe(60);
  });

  it('tracks the clock through the middle', () => {
    const p = progressOf(session(), 100, at('2026-07-01T06:30:00Z'));
    expect(p.fraction).toBeCloseTo(0.5, 6);
    expect(p.deliveredLiters).toBeCloseTo(3000, 6);
    expect(p.minutesLeft).toBe(30);
  });

  it('finishes exactly at the planned end', () => {
    const p = progressOf(session(), 100, at('2026-07-01T07:00:00Z'));
    expect(p.fraction).toBe(1);
    expect(p.deliveredLiters).toBeCloseTo(6000, 6);
    expect(p.minutesLeft).toBe(0);
  });

  it('does not keep counting once the session is over', () => {
    // The scheduler may not have closed the row yet; the numbers must still hold.
    const p = progressOf(session(), 100, at('2026-07-01T09:00:00Z'));
    expect(p.fraction).toBe(1);
    expect(p.deliveredLiters).toBe(6000);
    expect(p.minutesLeft).toBe(0);
  });

  it('survives a device whose clock ran backwards', () => {
    const p = progressOf(session(), 100, at('2026-07-01T05:00:00Z'));
    expect(p.fraction).toBe(0);
    expect(p.deliveredLiters).toBe(0);
  });
});

describe('litersForDeficit', () => {
  it('turns millimetres of deficit into litres for the field', () => {
    // 1 mm over 1 ha is 10 m3 = 10 000 L, before method losses
    expect(litersForDeficit(1, 'drip', 1)).toBeCloseTo(10000 / 0.9, 4);
  });

  it('makes a leaky method cost more water', () => {
    expect(litersForDeficit(10, 'furrow', 1)).toBeGreaterThan(litersForDeficit(10, 'drip', 1));
  });

  it('scales with area', () => {
    expect(litersForDeficit(10, 'drip', 3)).toBeCloseTo(litersForDeficit(10, 'drip', 1) * 3, 4);
  });
});
