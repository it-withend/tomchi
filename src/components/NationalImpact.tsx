import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { regions } from '../data/regions';
import { Icon } from './Icon';
import { uzShapes, UZ_W, UZ_H } from '../data/uzGeo';
import { fetchNationalImpact, type NationalImpact as Data } from '../lib/nationalImpact';

const nameOf = (id: string, lang: 'uz' | 'ru') =>
  regions.find((r) => r.id === id)?.name[lang] ?? id;

/** Animated count-up to `target` over ~1.2s. Falls back to the final value if
 *  requestAnimationFrame is throttled (e.g. a backgrounded tab), so the number
 *  never gets stuck at 0. */
function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) { setValue(0); return; }
    let raf = 0;
    let done = false;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setValue(target * (1 - Math.pow(1 - p, 3))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
      else done = true;
    };
    raf = requestAnimationFrame(tick);
    const fallback = setTimeout(() => { if (!done) setValue(target); }, dur + 300);
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [target, run]);
  return value;
}

/** Choropleth fill: light → deep water by savings intensity. */
function fillFor(saved: number, max: number): string {
  if (saved <= 0) return 'var(--color-wash)';
  const t = Math.sqrt(saved / max); // emphasise smaller values
  const pct = Math.round(18 + 72 * t);
  return `color-mix(in srgb, var(--color-water) ${pct}%, white)`;
}

export function NationalImpact() {
  const { lang, activeField } = useApp();
  const [data, setData] = useState<Data | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const seen = useRef(false);

  useEffect(() => {
    let alive = true;
    fetchNationalImpact().then((d) => {
      if (!alive) return;
      setData(d);
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  const dataReady = ready && !!data && data.fieldCount > 0;
  const animated = useCountUp(data?.totalSaved ?? 0, dataReady);
  if (dataReady) seen.current = true;

  const byRegion = data?.byRegion ?? {};
  const maxRegion = Math.max(1, ...Object.values(byRegion).map((r) => r.saved));
  const sel = selected ? byRegion[selected] : undefined;

  return (
    <section className="mt-8">
      <h2 className="mb-1 font-display text-lg font-medium text-ink">{t('nationalTitle', lang)}</h2>
      <p className="mb-4 text-sm text-ink/60">{t('nationalSub', lang)}</p>

      {/* Animated counter */}
      <div className="relative overflow-hidden rounded-3xl bg-water-deep p-6 text-white">
        <Icon name="drop" size={150} strokeWidth={1} className="pointer-events-none absolute -right-6 -top-6 opacity-10" />
        <p className="text-sm opacity-80">{t('nationalSaved', lang)}</p>
        {!dataReady ? (
          <div className="mt-2 h-9 w-40 animate-pulse rounded-lg bg-white/20" />
        ) : (
          <>
            <p className="mt-1 font-display text-4xl font-bold tabular-nums">
              {formatNum(Math.round(animated), lang)} <span className="text-2xl">{t('m3', lang)}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm opacity-80">
              <Icon name="coins" size={15} /> {formatNum(data!.totalMoney, lang)} {t('som', lang)} · {t('nationalGrowing', lang)}
            </p>
            {data!.pools >= 1 && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm">
                <Icon name="pool" size={16} /> {fmt(t('equalPools', lang), Math.round(data!.pools))}
              </p>
            )}
            <div className="mt-4 flex gap-6">
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">{formatNum(data!.fieldCount, lang)}</p>
                <p className="text-xs opacity-75">{t('nationalFields', lang)}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">{formatNum(data!.regionCount, lang)}</p>
                <p className="text-xs opacity-75">{t('nationalRegions', lang)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Interactive choropleth map of Uzbekistan */}
      <div className="mt-3 rounded-3xl border border-line bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{t('mapTitle', lang)}</p>
          {/* legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-ink/50">
            <span>{t('mapLegendLess', lang)}</span>
            <span className="h-3 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-water) 18%, white), var(--color-water))' }} />
            <span>{t('mapLegendMore', lang)}</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${UZ_W} ${UZ_H}`} className="w-full select-none" role="img" aria-label={t('mapTitle', lang)}>
          {uzShapes.map((s) => {
            const rd = byRegion[s.id];
            const saved = rd?.saved ?? 0;
            const isSel = selected === s.id;
            return (
              <path
                key={s.id}
                d={s.d}
                fillRule="evenodd"
                fill={dataReady ? fillFor(saved, maxRegion) : 'var(--color-wash)'}
                stroke={isSel ? 'var(--color-water-deep)' : 'var(--color-water-dim)'}
                strokeWidth={isSel ? 2 : 0.6}
                className="cursor-pointer transition-[fill,stroke] duration-200 hover:brightness-95"
                style={{ outline: 'none' }}
                tabIndex={0}
                role="button"
                aria-label={nameOf(s.id, lang)}
                onClick={() => setSelected((cur) => (cur === s.id ? null : s.id))}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(s.id); } }}
              />
            );
          })}
          {/* label + marker for the selected region */}
          {selected && (() => {
            const shape = uzShapes.find((x) => x.id === selected)!;
            return (
              <g key="sel-label" pointerEvents="none">
                <circle cx={shape.cx} cy={shape.cy} r={2.5} fill="var(--color-water-deep)" />
                <text x={shape.cx} y={shape.cy - 6} textAnchor="middle"
                  style={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-ink)', paintOrder: 'stroke', stroke: 'white', strokeWidth: 3 }}>
                  {nameOf(selected, lang)}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* selection detail / hint */}
        <div className="mt-2 min-h-[2.5rem] rounded-2xl bg-wash px-4 py-2 text-sm">
          {!selected ? (
            <span className="flex items-center gap-1.5 text-ink/50"><Icon name="touch" size={15} /> {t('mapTapHint', lang)}</span>
          ) : sel ? (
            <span className="flex items-center gap-1.5 text-ink">
              <b>{nameOf(selected, lang)}</b> — <Icon name="drop" size={14} className="text-water" /> {formatNum(sel.saved, lang)} {t('m3', lang)} · {formatNum(sel.count, lang)} {t('regionFields', lang)}
            </span>
          ) : (
            <span className="text-ink/60"><b>{nameOf(selected, lang)}</b> — {t('regionNoData', lang)}</span>
          )}
        </div>
      </div>

      {/* Regions comparison — which region saves the most water */}
      {dataReady && Object.values(byRegion).some((v) => v.saved > 0) && (
        <div className="mt-8">
          <div className="mb-1 flex items-center gap-2">
            <Icon name="chart" size={20} className="text-water-deep" />
            <h3 className="font-display text-lg font-medium text-ink">{t('regionsRankTitle', lang)}</h3>
          </div>
          <p className="mb-4 text-sm text-ink/60">{t('regionsRankSub', lang)}</p>
          <div className="space-y-2.5 rounded-3xl border border-line bg-card p-4">
            {Object.entries(byRegion)
              .filter(([, v]) => v.saved > 0)
              .sort((a, b) => b[1].saved - a[1].saved)
              .slice(0, 8)
              .map(([id, v], i, arr) => {
                const max = arr[0][1].saved || 1;
                const you = activeField?.regionId === id;
                return (
                  <div key={id} className="flex items-center gap-2.5">
                    <span className="w-4 shrink-0 text-right text-xs font-medium text-ink/40">{i + 1}</span>
                    <span className={`w-[5.5rem] shrink-0 truncate text-sm ${you ? 'font-semibold text-water-deep' : 'text-ink'}`}>
                      {nameOf(id, lang)}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-wash">
                      <div className={`h-full rounded-full ${you ? 'bg-water-deep' : 'bg-water'}`} style={{ width: `${Math.max(6, (v.saved / max) * 100)}%` }} />
                    </div>
                    <span className="w-14 shrink-0 text-right text-xs tabular-nums text-ink/60">{formatNum(v.saved, lang)}</span>
                    {you && <span className="shrink-0 rounded-full bg-water px-1.5 py-0.5 text-[9px] font-medium text-white">{t('yourRegion', lang)}</span>}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
}
