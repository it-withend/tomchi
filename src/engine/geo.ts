// Geometry for field outlines drawn on the map.
//
// Typing a hectare figure is the step farmers get wrong most often — it is
// guessed, or remembered from a document that described a different plot. Tracing
// the field on satellite imagery and measuring it removes the guess, and every
// downstream number (water volume, savings, cost) rests on that figure.
//
// Pure functions, no Leaflet: the maths is testable on its own.

export interface LatLng {
  lat: number;
  lng: number;
}

/** WGS-84 equatorial radius, the same figure Leaflet and Google Maps measure with. */
const EARTH_RADIUS_M = 6378137;
const DEG_TO_RAD = Math.PI / 180;
const M2_PER_HA = 10000;

/**
 * Area enclosed by a polygon of geographic coordinates, in square metres.
 *
 * Uses the spherical-excess sum rather than projecting to a plane, so a field
 * measured in Karakalpakstan is as accurate as one in Fergana. Fewer than three
 * points enclose nothing.
 */
export function polygonAreaM2(points: LatLng[]): number {
  const n = points.length;
  if (n < 3) return 0;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    sum += (b.lng - a.lng) * DEG_TO_RAD * (2 + Math.sin(a.lat * DEG_TO_RAD) + Math.sin(b.lat * DEG_TO_RAD));
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export function polygonAreaHa(points: LatLng[]): number {
  return polygonAreaM2(points) / M2_PER_HA;
}

/**
 * A point to aim the satellite tile and the weather lookup at.
 *
 * This is the average of the corners, which sits inside any field shaped like a
 * field. A deeply concave outline could push it outside the plot; that is a
 * trade worth making against carrying a point-in-polygon routine for a case
 * farmland rarely produces.
 */
export function polygonCentre(points: LatLng[]): LatLng | null {
  if (!points.length) return null;
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

/** Area rounded the way the rest of the app stores it: two decimals of a hectare. */
export function roundHa(ha: number): number {
  return Math.round(ha * 100) / 100;
}

/**
 * The size range the app will accept for a field, in hectares.
 *
 * These bound what the rest of the app can sensibly work with, and they matter
 * on the map too: a farmer zoomed out to their whole province can trace a
 * "field" of several thousand hectares in four taps. Catching that where it is
 * drawn explains the problem, instead of leaving a disabled button further on.
 */
export const MIN_FIELD_HA = 0.01;
export const MAX_FIELD_HA = 500;

export function isPlausibleFieldArea(ha: number): boolean {
  return ha >= MIN_FIELD_HA && ha <= MAX_FIELD_HA;
}
