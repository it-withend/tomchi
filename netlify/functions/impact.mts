// National impact aggregate: total water + money saved across ALL Tomchi
// fields, plus a per-region breakdown for the map. Uses the Supabase service
// role (bypasses RLS) and computes savings with the same FAO-56 engine as the
// app. No personal data is returned — only anonymous aggregates.
import { seasonTotals, SOM_PER_M3, POOL_M3 } from '../../src/engine/irrigation';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300', // 5 min — cheap and fresh enough
};

export default async (req: Request): Promise<Response> => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const empty = { totalSaved: 0, totalMoney: 0, totalUsed: 0, fieldCount: 0, regionCount: 0, pools: 0, byRegion: {}, top: [] };
  if (!url || !key) return new Response(JSON.stringify(empty), { headers: cors });

  const me = new URL(req.url).searchParams.get('me'); // caller's anon owner id (to mark "you")

  try {
    const res = await fetch(`${url}/rest/v1/fields?select=owner,region_id,crop_id,area_ha,method,soil`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const rows: any[] = res.ok ? await res.json() : [];

    let totalSaved = 0;
    let totalUsed = 0;
    const byRegion: Record<string, { saved: number; count: number }> = {};
    const fields: { regionId: string; cropId: string; saved: number; you: boolean }[] = [];

    for (const r of rows) {
      const field = {
        id: 'agg',
        regionId: r.region_id,
        cropId: r.crop_id,
        areaHa: Number(r.area_ha) || 0,
        method: r.method,
        soil: r.soil,
      };
      const tot = seasonTotals(field as any);
      totalSaved += tot.m3Saved;
      totalUsed += tot.m3Field;
      const b = (byRegion[r.region_id] ??= { saved: 0, count: 0 });
      b.saved += tot.m3Saved;
      b.count += 1;
      if (tot.m3Saved > 0) {
        fields.push({ regionId: r.region_id, cropId: r.crop_id, saved: Math.round(tot.m3Saved), you: !!me && r.owner === me });
      }
    }

    const top = fields.sort((a, b) => b.saved - a.saved).slice(0, 10);

    const payload = {
      totalSaved: Math.round(totalSaved),
      totalMoney: Math.round(totalSaved * SOM_PER_M3),
      totalUsed: Math.round(totalUsed),
      fieldCount: rows.length,
      regionCount: Object.keys(byRegion).length,
      pools: totalSaved / POOL_M3,
      byRegion,
      top,
    };
    return new Response(JSON.stringify(payload), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify(empty), { headers: cors });
  }
};
