import { describe, it, expect } from 'vitest';
import { soilWater, rootDepthAt, adjustedDepletionFraction, availableWaterPerMetre } from './soilWater';
import { getCrop, type FieldConfig } from './irrigation';
import type { Forecast, WeatherDay } from './weather';

// Cotton is the reference crop: planted 1 April, stages 30/50/55/45 = 180 days.
const cotton = getCrop('cotton');

const field = (over: Partial<FieldConfig> = {}): FieldConfig => ({
  id: 'f1', regionId: 'tashkent', cropId: 'cotton',
  areaHa: 1, method: 'furrow', soil: 'loam', ...over,
});

/** Forecast with a fixed ET0 and rainfall for every day, so ETc is exact. */
function flatForecast(from: string, days: number, et0: number, rainMm = 0): Forecast {
  const out: WeatherDay[] = [];
  const start = new Date(from + 'T00:00:00');
  for (let i = -1; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    out.push({ date: d.toISOString().slice(0, 10), et0, rainMm, rainProb: 0, tMax: 30, tMin: 18 });
  }
  return { fetchedAt: Date.now(), regionId: 'tashkent', days: out };
}

describe('rootDepthAt', () => {
  it('starts at the planting depth', () => {
    expect(rootDepthAt(cotton, 0)).toBeCloseTo(0.3, 5);
  });

  it('reaches full depth once the crop is fully developed', () => {
    // initial 30 + development 50 = 80 days to full cover
    expect(rootDepthAt(cotton, 80)).toBeCloseTo(1.0, 5);
  });

  it('grows linearly in between', () => {
    expect(rootDepthAt(cotton, 40)).toBeCloseTo(0.3 + 0.7 * (40 / 80), 5);
  });

  it('does not keep deepening after full cover', () => {
    expect(rootDepthAt(cotton, 170)).toBeCloseTo(1.0, 5);
  });
});

describe('adjustedDepletionFraction', () => {
  it('leaves p untouched at the 5 mm/day reference', () => {
    expect(adjustedDepletionFraction(0.65, 5)).toBeCloseTo(0.65, 10);
  });

  it('tightens the threshold as the crop transpires harder', () => {
    expect(adjustedDepletionFraction(0.65, 8)).toBeLessThan(0.65);
  });

  it('clamps to the FAO-56 bounds', () => {
    expect(adjustedDepletionFraction(0.65, 0)).toBeCloseTo(0.8, 10);   // would be 0.85
    expect(adjustedDepletionFraction(0.1, 20)).toBeCloseTo(0.1, 10);   // would be negative
  });
});

describe('soilWater', () => {
  it('reports out of season without dividing by zero', () => {
    const s = soilWater(field(), null, new Date('2026-01-15T12:00:00'));
    expect(s.inSeason).toBe(false);
    expect(s.taw).toBe(0);
    expect(s.moisturePct).toBe(100);
    expect(s.daysUntilIrrigation).toBeNull();
  });

  it('sizes the bucket from soil texture and root depth', () => {
    const on = new Date('2026-06-11T12:00:00');       // day 71 of the season
    const s = soilWater(field({ log: [{ date: '2026-06-01T06:00:00', type: 'watered' }] }), null, on);
    const expectedRoot = rootDepthAt(cotton, 71);
    expect(s.rootDepth).toBeCloseTo(expectedRoot, 5);
    expect(s.taw).toBeCloseTo(availableWaterPerMetre.loam * expectedRoot, 5);
  });

  it('holds less water in sand than in loam', () => {
    const on = new Date('2026-06-11T12:00:00');
    const log = [{ date: '2026-06-01T06:00:00', type: 'watered' as const }];
    const sandy = soilWater(field({ soil: 'sandy', log }), null, on);
    const loam = soilWater(field({ soil: 'loam', log }), null, on);
    expect(sandy.taw).toBeLessThan(loam.taw);
  });

  it('drains by ETc for every day since the last watering', () => {
    // 10 dry days at ET0 5 mm and Kc 0.75 (development) = 37.5 mm gone
    const s = soilWater(
      field({ log: [{ date: '2026-06-01T06:00:00', type: 'watered' }] }),
      flatForecast('2026-06-01', 12, 5),
      new Date('2026-06-11T12:00:00'),
    );
    expect(s.depletion).toBeCloseTo(37.5, 6);
  });

  it('counts rain against the deficit', () => {
    const dry = soilWater(
      field({ log: [{ date: '2026-06-01T06:00:00', type: 'watered' }] }),
      flatForecast('2026-06-01', 12, 5),
      new Date('2026-06-11T12:00:00'),
    );
    const wet = soilWater(
      field({ log: [{ date: '2026-06-01T06:00:00', type: 'watered' }] }),
      flatForecast('2026-06-01', 12, 5, 1),   // 1 mm every day
      new Date('2026-06-11T12:00:00'),
    );
    expect(wet.depletion).toBeCloseTo(dry.depletion - 10, 6);
  });

  it('treats a logged rain as a refill, like a watering', () => {
    const on = new Date('2026-06-11T12:00:00');
    const fc = flatForecast('2026-06-01', 12, 5);
    const watered = soilWater(field({ log: [{ date: '2026-06-05T06:00:00', type: 'watered' }] }), fc, on);
    const rained = soilWater(field({ log: [{ date: '2026-06-05T06:00:00', type: 'rain' }] }), fc, on);
    expect(rained.depletion).toBeCloseTo(watered.depletion, 6);
  });

  it('never dries past the bucket or fills past the brim', () => {
    const log = [{ date: '2026-05-01T06:00:00', type: 'watered' as const }];
    const on = new Date('2026-06-11T12:00:00');

    const scorched = soilWater(field({ log }), flatForecast('2026-05-01', 45, 60), on);
    expect(scorched.depletion).toBeCloseTo(scorched.taw, 6);
    expect(scorched.moisturePct).toBe(0);

    const flooded = soilWater(field({ log }), flatForecast('2026-05-01', 45, 5, 500), on);
    expect(flooded.depletion).toBe(0);
    expect(flooded.moisturePct).toBe(100);
  });

  it('calls for irrigation once the deficit passes RAW', () => {
    const on = new Date('2026-06-11T12:00:00');
    const fresh = soilWater(
      field({ log: [{ date: '2026-06-10T06:00:00', type: 'watered' }] }),
      flatForecast('2026-06-01', 20, 5), on,
    );
    expect(fresh.needsIrrigation).toBe(false);
    expect(fresh.daysUntilIrrigation).toBeGreaterThan(0);

    const parched = soilWater(
      field({ log: [{ date: '2026-05-05T06:00:00', type: 'watered' }] }),
      flatForecast('2026-05-01', 50, 12), on,
    );
    expect(parched.needsIrrigation).toBe(true);
    expect(parched.daysUntilIrrigation).toBe(0);
  });

  it('asks for more water on a leakier irrigation method', () => {
    const log = [{ date: '2026-06-01T06:00:00', type: 'watered' as const }];
    const on = new Date('2026-06-11T12:00:00');
    const fc = flatForecast('2026-06-01', 12, 5);
    const furrow = soilWater(field({ log, method: 'furrow' }), fc, on);
    const drip = soilWater(field({ log, method: 'drip' }), fc, on);

    expect(furrow.netMm).toBeCloseTo(drip.netMm, 6);   // the soil needs the same
    expect(furrow.grossM3).toBeGreaterThan(drip.grossM3); // the pump must send more
    expect(drip.grossM3).toBeCloseTo((drip.netMm / 0.9) * 10 * 1, 5);
  });

  it('scales the gross volume with field size', () => {
    const log = [{ date: '2026-06-01T06:00:00', type: 'watered' as const }];
    const on = new Date('2026-06-11T12:00:00');
    const fc = flatForecast('2026-06-01', 12, 5);
    const one = soilWater(field({ log, areaHa: 1 }), fc, on);
    const three = soilWater(field({ log, areaHa: 3 }), fc, on);
    expect(three.grossM3).toBeCloseTo(one.grossM3 * 3, 6);
  });
});
