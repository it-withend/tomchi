// Satellite field health (NDVI) from Copernicus Sentinel-2, via Sentinel Hub on
// the Copernicus Data Space Ecosystem. Given a field centre (lat/lng) and area,
// returns a coloured NDVI image of the plot plus a health score and the date of
// the latest clear scene. No hardware, no personal data — just open EU imagery.
//
// Credentials (SH_CLIENT_ID / SH_CLIENT_SECRET) are server-only OAuth client
// credentials; they must never reach the client bundle.

const TOKEN_URL =
  'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const PROCESS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/process';
const STATS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/statistics';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=86400', // a scene changes every ~5 days
};

// Cache the bearer token in module scope across warm invocations.
let tokenCache: { token: string; exp: number } | null = null;

async function getToken(id: string, secret: string): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 30_000) return tokenCache.token;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  if (!res.ok) throw new Error('token ' + res.status);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return j.access_token;
}

// A square bbox (in degrees) around the field centre. We show a bit more than
// the field itself for context; clamp so a tiny plot is still legible and a huge
// one stays within Sentinel Hub's per-pixel resolution limit.
function bboxAround(lat: number, lng: number, ha: number): [number, number, number, number] {
  const sideM = Math.sqrt(Math.max(ha, 0.1) * 10_000); // field edge length
  const halfM = Math.min(Math.max((sideM * 1.6) / 2, 200), 1500);
  const dLat = halfM / 111_320;
  const dLng = halfM / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

// Colour ramp shared by the picture: brown (bare/stressed) → green (vigorous).
const IMG_EVALSCRIPT = `//VERSION=3
function setup(){return{input:["B04","B08","dataMask"],output:{bands:4}};}
function evaluatePixel(s){
  let ndvi=(s.B08-s.B04)/(s.B08+s.B04);
  let c;
  if(ndvi<0.15)c=[0.78,0.45,0.20];
  else if(ndvi<0.30)c=[0.90,0.62,0.28];
  else if(ndvi<0.45)c=[0.96,0.86,0.38];
  else if(ndvi<0.60)c=[0.60,0.80,0.32];
  else if(ndvi<0.75)c=[0.30,0.66,0.26];
  else c=[0.12,0.48,0.20];
  return[c[0],c[1],c[2],s.dataMask];
}`;

// Stats evalscript: raw NDVI, with cloud/shadow/snow SCL classes masked out.
const STATS_EVALSCRIPT = `//VERSION=3
function setup(){return{input:[{bands:["B04","B08","SCL","dataMask"]}],output:[{id:"ndvi",bands:1},{id:"dataMask",bands:1}]};}
function evaluatePixel(s){
  let valid=s.dataMask;
  let c=s.SCL;
  if(c==3||c==8||c==9||c==10||c==11)valid=0;
  let ndvi=(s.B08-s.B04)/(s.B08+s.B04);
  return{ndvi:[ndvi],dataMask:[valid]};
}`;

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface Bucket { date: string; mean: number; valid: number }

async function clearBuckets(
  token: string, bbox: number[], fromISO: string, toISO: string,
): Promise<Bucket[]> {
  const body = {
    input: {
      bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
      data: [{ type: 'sentinel-2-l2a', dataFilter: { maxCloudCoverage: 60 } }],
    },
    aggregation: {
      timeRange: { from: fromISO, to: toISO },
      // Daily buckets so a populated bucket's date is the real Sentinel-2 pass,
      // not just a window boundary. Most days are empty (5-day revisit).
      aggregationInterval: { of: 'P1D' },
      resx: 0.00018, resy: 0.00018,
      evalscript: STATS_EVALSCRIPT,
    },
    calculations: { ndvi: { statistics: { default: {} } } },
  };
  const res = await fetch(STATS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { data?: any[] };
  const buckets: Bucket[] = [];
  let maxValid = 0;
  for (const b of j.data ?? []) {
    const st = b?.outputs?.ndvi?.bands?.B0?.stats;
    if (!st || st.mean == null) continue;
    const valid = (st.sampleCount ?? 0) - (st.noDataCount ?? 0);
    if (valid <= 0) continue;
    maxValid = Math.max(maxValid, valid);
    buckets.push({ date: b.interval.from.slice(0, 10), mean: st.mean, valid });
  }
  // Keep only scenes that actually cover the plot (≥40% valid pixels), so a
  // mostly-cloudy pass doesn't produce a misleading score.
  const good = buckets.filter((b) => b.valid >= 0.4 * maxValid);
  return good.length ? good : buckets;
}

async function ndviImage(token: string, bbox: number[], fromISO: string, toISO: string): Promise<string | null> {
  const body = {
    input: {
      bounds: { bbox },
      data: [{
        type: 'sentinel-2-l2a',
        dataFilter: { timeRange: { from: fromISO, to: toISO }, maxCloudCoverage: 40, mosaickingOrder: 'leastCC' },
      }],
    },
    output: { width: 512, height: 512, responses: [{ identifier: 'default', format: { type: 'image/png' } }] },
    evalscript: IMG_EVALSCRIPT,
  };
  const res = await fetch(PROCESS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'image/png' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) return null;
  return 'data:image/png;base64,' + buf.toString('base64');
}

export default async (req: Request): Promise<Response> => {
  const id = process.env.SH_CLIENT_ID;
  const secret = process.env.SH_CLIENT_SECRET;
  if (!id || !secret) {
    return new Response(JSON.stringify({ ok: false, error: 'not_configured' }), { status: 503, headers: cors });
  }

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const ha = Number(url.searchParams.get('ha')) || 1;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_coords' }), { status: 400, headers: cors });
  }

  try {
    const token = await getToken(id, secret);
    const bbox = bboxAround(lat, lng, ha);
    const now = new Date();
    const from = new Date(now.getTime() - 90 * 864e5); // ~a season's worth of passes
    const fromISO = from.toISOString();
    const toISO = now.toISOString();

    const buckets = await clearBuckets(token, bbox as number[], fromISO, toISO);
    const bucket = buckets.at(-1) ?? null;
    // Centre the picture on the clear scene we scored (± a few days), else fall
    // back to the whole window's least-cloudy mosaic.
    let imgFrom = fromISO, imgTo = toISO;
    if (bucket) {
      const d = new Date(bucket.date + 'T00:00:00Z');
      imgFrom = isoDay(new Date(d.getTime() - 6 * 864e5)) + 'T00:00:00Z';
      imgTo = isoDay(new Date(d.getTime() + 1 * 864e5)) + 'T23:59:59Z';
    }
    const img = await ndviImage(token, bbox as number[], imgFrom, imgTo);

    // Map NDVI 0.15 → 0 %, 0.80 → 100 %.
    const toHealth = (m: number) => Math.max(0, Math.min(100, Math.round(((m - 0.15) / 0.65) * 100)));
    const mean = bucket?.mean ?? null;
    const health = mean == null ? null : toHealth(mean);
    const status = mean == null ? 'nodata' : mean >= 0.6 ? 'healthy' : mean >= 0.4 ? 'moderate' : 'stressed';
    const history = buckets.map((b) => ({ date: b.date, health: toHealth(b.mean) }));

    return new Response(
      JSON.stringify({ ok: true, img, meanNdvi: mean, health, status, date: bucket?.date ?? null, history }),
      { headers: cors },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 502, headers: cors });
  }
};
