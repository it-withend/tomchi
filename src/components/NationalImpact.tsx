import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { regions } from '../data/regions';
import { fetchNationalImpact, type NationalImpact as Data } from '../lib/nationalImpact';

// Equirectangular projection over Uzbekistan's bounding box.
const BOX = { lonMin: 55.5, lonMax: 73.5, latMin: 37.0, latMax: 45.7 };
const W = 400;
const H = 260;
const PAD = 26;
function project(lon: number, lat: number) {
  const x = PAD + ((lon - BOX.lonMin) / (BOX.lonMax - BOX.lonMin)) * (W - 2 * PAD);
  const y = PAD + ((BOX.latMax - lat) / (BOX.latMax - BOX.latMin)) * (H - 2 * PAD);
  return { x, y };
}

/** Animated count-up to `target` over ~1.2s. */
function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return value;
}

export function NationalImpact() {
  const { lang } = useApp();
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'empty'>('loading');
  const seen = useRef(false);

  useEffect(() => {
    let alive = true;
    fetchNationalImpact().then((d) => {
      if (!alive) return;
      if (!d || d.fieldCount === 0) { setState('empty'); return; }
      setData(d);
      setState('ready');
    });
    return () => { alive = false; };
  }, []);

  const target = data?.totalSaved ?? 0;
  const animated = useCountUp(target, state === 'ready');
  if (state === 'ready') seen.current = true;

  const maxRegion = data
    ? Math.max(1, ...Object.values(data.byRegion).map((r) => r.saved))
    : 1;

  return (
    <section className="mt-8">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl" aria-hidden>🇺🇿</span>
        <h2 className="font-display text-lg font-medium text-ink">{t('nationalTitle', lang)}</h2>
      </div>
      <p className="mb-4 text-sm text-ink/60">{t('nationalSub', lang)}</p>

      {state === 'loading' && (
        <div className="rounded-3xl border border-line bg-card p-6 text-center text-sm text-ink/50">
          {t('nationalLoading', lang)}
        </div>
      )}

      {state === 'empty' && (
        <div className="rounded-3xl border border-line bg-card p-6 text-center text-sm text-ink/60">
          {t('nationalEmpty', lang)}
        </div>
      )}

      {state === 'ready' && data && (
        <>
          {/* Big animated counter */}
          <div className="relative overflow-hidden rounded-3xl bg-water-deep p-6 text-white">
            <div className="absolute -right-8 -top-8 text-[9rem] leading-none opacity-10" aria-hidden>💧</div>
            <p className="text-sm opacity-80">{t('nationalSaved', lang)}</p>
            <p className="mt-1 font-display text-4xl font-bold tabular-nums">
              {formatNum(Math.round(animated), lang)} <span className="text-2xl">m³</span>
            </p>
            <p className="mt-0.5 text-sm opacity-80">
              💰 {formatNum(data.totalMoney, lang)} {t('som', lang)} · {t('nationalGrowing', lang)}
            </p>
            {data.pools >= 1 && (
              <p className="mt-4 inline-block rounded-xl bg-white/10 px-3 py-2 text-sm">
                🏊 {fmt(t('equalPools', lang), Math.round(data.pools))}
              </p>
            )}
            <div className="mt-4 flex gap-6">
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">{formatNum(data.fieldCount, lang)}</p>
                <p className="text-xs opacity-75">{t('nationalFields', lang)}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">{formatNum(data.regionCount, lang)}</p>
                <p className="text-xs opacity-75">{t('nationalRegions', lang)}</p>
              </div>
            </div>
          </div>

          {/* Regional bubble map */}
          <div className="mt-3 rounded-3xl border border-line bg-card p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/50">{t('mapTitle', lang)}</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('mapTitle', lang)}>
              {regions.map((r) => {
                const { x, y } = project(r.lon, r.lat);
                const rd = data.byRegion[r.id];
                if (!rd || rd.saved <= 0) {
                  return <circle key={r.id} cx={x} cy={y} r={2.5} fill="var(--color-line)" />;
                }
                const radius = 6 + 20 * Math.sqrt(rd.saved / maxRegion);
                return (
                  <g key={r.id}>
                    <circle cx={x} cy={y} r={radius} fill="var(--color-water)" opacity={0.28} />
                    <circle cx={x} cy={y} r={radius} fill="none" stroke="var(--color-water-deep)" strokeWidth={1.5} opacity={0.6} />
                    <circle cx={x} cy={y} r={3} fill="var(--color-water-deep)" />
                    <text
                      x={x}
                      y={y - radius - 4}
                      textAnchor="middle"
                      style={{ fontSize: 10, fontWeight: 600, fill: 'var(--color-ink)' }}>
                      {r.name[lang]}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-1 text-center text-[11px] text-ink/40">{t('mapLegend', lang)}</p>
          </div>
        </>
      )}
    </section>
  );
}
