import { describe, it, expect } from 'vitest';
import { polygonAreaM2, polygonAreaHa, polygonCentre, roundHa, type LatLng } from './geo';

/** Square of `side` degrees with its south-west corner at (lat, lng). */
const square = (lat: number, lng: number, side: number): LatLng[] => [
  { lat, lng },
  { lat, lng: lng + side },
  { lat: lat + side, lng: lng + side },
  { lat: lat + side, lng },
];

const TASHKENT = { lat: 41.31, lng: 69.24 };

describe('polygonAreaM2', () => {
  it('encloses nothing with fewer than three points', () => {
    expect(polygonAreaM2([])).toBe(0);
    expect(polygonAreaM2([TASHKENT])).toBe(0);
    expect(polygonAreaM2([TASHKENT, { lat: 41.32, lng: 69.25 }])).toBe(0);
  });

  it('measures a 0.01° square at the equator', () => {
    // 0.01° is 1113.2 m of latitude, and the same of longitude on the equator,
    // so the plot is about 1.239 km² — checked against the flat approximation.
    const area = polygonAreaM2(square(0, 0, 0.01));
    expect(area).toBeGreaterThan(1_235_000);
    expect(area).toBeLessThan(1_243_000);
  });

  it('shrinks the same span of longitude as it moves away from the equator', () => {
    // Meridians converge, so a degree box in Uzbekistan covers less ground.
    const equator = polygonAreaM2(square(0, 0, 0.01));
    const tashkent = polygonAreaM2(square(41.31, 69.24, 0.01));
    expect(tashkent).toBeLessThan(equator);
    expect(tashkent / equator).toBeCloseTo(Math.cos(41.315 * Math.PI / 180), 2);
  });

  it('does not care which way round the corners were tapped', () => {
    const clockwise = square(41.31, 69.24, 0.005);
    const anticlockwise = [...clockwise].reverse();
    expect(polygonAreaM2(anticlockwise)).toBeCloseTo(polygonAreaM2(clockwise), 6);
  });

  it('grows with the square of the side', () => {
    const small = polygonAreaM2(square(41.31, 69.24, 0.005));
    const double = polygonAreaM2(square(41.31, 69.24, 0.01));
    expect(double / small).toBeCloseTo(4, 1);
  });

  it('handles a triangle', () => {
    const tri: LatLng[] = [
      { lat: 41.31, lng: 69.24 },
      { lat: 41.31, lng: 69.25 },
      { lat: 41.32, lng: 69.24 },
    ];
    const box = polygonAreaM2(square(41.31, 69.24, 0.01));
    expect(polygonAreaM2(tri)).toBeCloseTo(box / 2, -2);
  });
});

describe('polygonAreaHa', () => {
  it('is the square-metre figure in hectares', () => {
    const outline = square(41.31, 69.24, 0.01);
    expect(polygonAreaHa(outline)).toBeCloseTo(polygonAreaM2(outline) / 10000, 9);
  });

  it('gives a plausible smallholding for a 100 m plot', () => {
    // 0.0009° of latitude is about 100 m; at this latitude the box is ~0.75 ha.
    const ha = polygonAreaHa(square(41.31, 69.24, 0.0009));
    expect(ha).toBeGreaterThan(0.5);
    expect(ha).toBeLessThan(1.0);
  });
});

describe('polygonCentre', () => {
  it('is null without any points', () => {
    expect(polygonCentre([])).toBeNull();
  });

  it('sits in the middle of a square', () => {
    const c = polygonCentre(square(41.31, 69.24, 0.01))!;
    expect(c.lat).toBeCloseTo(41.315, 9);
    expect(c.lng).toBeCloseTo(69.245, 9);
  });

  it('returns the point itself for a single corner', () => {
    expect(polygonCentre([TASHKENT])).toEqual(TASHKENT);
  });
});

describe('roundHa', () => {
  it('keeps two decimals, which is how the app stores area', () => {
    expect(roundHa(1.23456)).toBe(1.23);
    expect(roundHa(2.005)).toBe(2.01);
    expect(roundHa(0.001)).toBe(0);
  });
});
