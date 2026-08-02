import { describe, it, expect } from 'vitest';
import {
  getCrop, getRegion, seasonLength, daysIntoSeason, stageAt, et0At,
  dayStatus, seasonCalendar, seasonTotals, nextWatering, upcomingWaterings,
  soilIntervalFactor, type FieldConfig,
} from './irrigation';
import { methodEfficiency } from '../data/crops';

const cotton = getCrop('cotton');   // 1 April, 30/50/55/45 = 180 days
const wheat = getCrop('wheat');     // 1 October, 40/120/60/30 = 250 days

const field = (over: Partial<FieldConfig> = {}): FieldConfig => ({
  id: 'f1', regionId: 'tashkent', cropId: 'cotton',
  areaHa: 1, method: 'furrow', soil: 'loam', ...over,
});

describe('season arithmetic', () => {
  it('sums the stage lengths', () => {
    expect(seasonLength(cotton)).toBe(180);
    expect(seasonLength(wheat)).toBe(250);
  });

  it('counts days from the planting month', () => {
    expect(daysIntoSeason(cotton, new Date('2026-04-01T12:00:00'))).toBe(0);
    expect(daysIntoSeason(cotton, new Date('2026-05-01T12:00:00'))).toBe(30);
  });

  it('reports out of season outside the window', () => {
    expect(daysIntoSeason(cotton, new Date('2026-01-15T12:00:00'))).toBe(-1);
    expect(daysIntoSeason(cotton, new Date('2026-11-01T12:00:00'))).toBe(-1);
  });

  it('carries a winter crop across the new year', () => {
    // Winter wheat goes in on 1 October and is still growing in January.
    const daysIn = daysIntoSeason(wheat, new Date('2026-01-15T12:00:00'));
    expect(daysIn).toBeGreaterThan(0);
    expect(daysIn).toBeLessThan(seasonLength(wheat));
  });
});

describe('stageAt', () => {
  it('walks the stages in order', () => {
    expect(stageAt(cotton, 0).key).toBe('initial');
    expect(stageAt(cotton, 29).key).toBe('initial');
    expect(stageAt(cotton, 30).key).toBe('development');
    expect(stageAt(cotton, 79).key).toBe('development');
    expect(stageAt(cotton, 80).key).toBe('mid');
    expect(stageAt(cotton, 134).key).toBe('mid');
    expect(stageAt(cotton, 135).key).toBe('late');
  });

  it('peaks at flowering, which is where the water goes', () => {
    const mid = stageAt(cotton, 100).kc;
    expect(mid).toBeGreaterThan(stageAt(cotton, 10).kc);
    expect(mid).toBeGreaterThan(stageAt(cotton, 170).kc);
  });

  it('stays on the last stage past the end rather than falling over', () => {
    expect(stageAt(cotton, 999).key).toBe('late');
  });
});

describe('et0At', () => {
  const region = getRegion('tashkent');

  it('is highest in summer and lowest in winter', () => {
    const july = et0At(region, new Date('2026-07-15T12:00:00'));
    const january = et0At(region, new Date('2026-01-15T12:00:00'));
    expect(july).toBeGreaterThan(january);
  });

  it('moves smoothly across a month boundary', () => {
    const before = et0At(region, new Date('2026-06-30T12:00:00'));
    const after = et0At(region, new Date('2026-07-01T12:00:00'));
    expect(Math.abs(after - before)).toBeLessThan(0.5);
  });
});

describe('dayStatus', () => {
  const on = new Date('2026-07-01T12:00:00');

  it('applies Kc to ET0 to get the crop need', () => {
    const s = dayStatus(field(), on);
    expect(s.inSeason).toBe(true);
    expect(s.etc).toBeCloseTo(s.et0 * s.kc, 6);
  });

  it('adds the losses of the irrigation method on top', () => {
    const s = dayStatus(field({ method: 'furrow' }), on);
    expect(s.grossMm).toBeCloseTo(s.etc / methodEfficiency.furrow, 6);
    expect(s.grossMm).toBeGreaterThan(s.etc);
  });

  it('turns millimetres into litres for the whole field', () => {
    const s = dayStatus(field({ areaHa: 2 }), on);
    expect(s.litersPerDay).toBeCloseTo(s.grossMm * 10000 * 2, 4);
  });

  it('needs less water under drip than under furrow', () => {
    const furrow = dayStatus(field({ method: 'furrow' }), on);
    const drip = dayStatus(field({ method: 'drip' }), on);
    expect(drip.litersPerDay).toBeLessThan(furrow.litersPerDay);
    expect(drip.etc).toBeCloseTo(furrow.etc, 6);   // the plant wants the same
  });

  it('waters sand more often than clay', () => {
    const sandy = dayStatus(field({ soil: 'sandy' }), on).intervalDays;
    const clay = dayStatus(field({ soil: 'clay' }), on).intervalDays;
    expect(sandy).toBeLessThan(clay);
    expect(soilIntervalFactor.sandy).toBeLessThan(soilIntervalFactor.clay);
  });

  it('zeroes everything out of season', () => {
    const s = dayStatus(field(), new Date('2026-01-15T12:00:00'));
    expect(s.inSeason).toBe(false);
    expect(s.stage).toBe('off');
    expect(s.litersPerDay).toBe(0);
    expect(s.intervalDays).toBe(0);
  });
});

describe('seasonCalendar and totals', () => {
  it('gives twelve months and no water outside the season', () => {
    const rows = seasonCalendar(field(), 2026);
    expect(rows).toHaveLength(12);
    expect(rows[0].m3PerHa).toBe(0);       // January: cotton is not in the ground
    expect(rows[6].m3PerHa).toBeGreaterThan(0); // July: peak
  });

  it('scales the field total by area', () => {
    const rows = seasonCalendar(field({ areaHa: 4 }), 2026);
    rows.forEach((r) => expect(r.m3Field).toBeCloseTo(r.m3PerHa * 4, 6));
  });

  it('shows drip saving water against furrow', () => {
    const t = seasonTotals(field({ method: 'drip' }));
    expect(t.m3Drip).toBeLessThan(t.m3Furrow);
    expect(t.m3Saved).toBeCloseTo(t.m3Furrow - t.m3Field, 6);
    expect(t.m3Saved).toBeGreaterThan(0);
  });

  it('saves nothing when the farmer already floods', () => {
    const t = seasonTotals(field({ method: 'furrow' }));
    expect(t.m3Saved).toBe(0);
  });
});

describe('watering schedule', () => {
  const on = new Date('2026-07-01T12:00:00');

  it('counts the interval from the last event', () => {
    const s = dayStatus(field(), on);
    const next = nextWatering(field({ log: [{ date: '2026-07-01T06:00:00', type: 'watered' }] }), on);
    expect(next).not.toBeNull();
    expect(next!.daysLeft).toBe(s.intervalDays);
    expect(next!.overdue).toBe(false);
  });

  it('flags an overdue field', () => {
    const next = nextWatering(field({ log: [{ date: '2026-05-20T06:00:00', type: 'watered' }] }), on);
    expect(next!.overdue).toBe(true);
    expect(next!.daysLeft).toBeLessThan(0);
  });

  it('returns nothing out of season', () => {
    expect(nextWatering(field(), new Date('2026-01-15T12:00:00'))).toBeNull();
  });

  it('lists upcoming dates in ascending order', () => {
    const dates = upcomingWaterings(field({ log: [{ date: '2026-07-01T06:00:00', type: 'watered' }] }), 4, on);
    expect(dates.length).toBeGreaterThan(1);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime());
    }
  });
});
