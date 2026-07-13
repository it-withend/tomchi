import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { seasonTotals, SOM_PER_M3, POOL_M3, type FieldConfig } from '../engine/irrigation';
import { methodEfficiency } from '../data/crops';
import { NationalImpact } from './NationalImpact';

export function Impact({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const tot = seasonTotals(field);
  const savedSom = tot.m3Saved * SOM_PER_M3;
  const pools = tot.m3Saved / POOL_M3;
  const extraIfDrip = Math.max(0, tot.m3Field - tot.m3Drip);
  const eff = Math.round(methodEfficiency[field.method] * 100);
  const methodLabel = t(field.method, lang);

  return (
    <div className="px-5 pb-28 pt-6">
      <h2 className="font-display text-lg font-medium text-ink">{t('impactTitle', lang)}</h2>
      <p className="mb-5 text-sm text-ink/60">
        {t('yourMethod', lang)}: {methodLabel} · {t('efficiency', lang)} {eff}%
      </p>

      {field.method === 'furrow' ? (
        <div className="rounded-3xl border border-water/30 bg-water/5 p-5">
          <p className="leading-relaxed">
            {fmt(t('switchToDrip', lang), formatNum(extraIfDrip, lang))}
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-water-deep">
            {formatNum(extraIfDrip * SOM_PER_M3, lang)} {t('som', lang)}
          </p>
          <p className="text-sm text-ink/60">{t('perSeason', lang)}</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-water-deep p-6 text-white">
            <p className="text-sm opacity-80">{t('waterSavedSeason', lang)}</p>
            <p className="mt-1 font-display text-4xl font-bold">{formatNum(tot.m3Saved, lang)} m³</p>
            <p className="mt-0.5 text-sm opacity-80">{t('vsFlood', lang)}</p>
            {pools >= 1 && (
              <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-sm">
                🏊 {fmt(t('equalPools', lang), Math.round(pools))}
              </p>
            )}
          </div>
          <div className="mt-3 rounded-3xl border border-line bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{t('moneySaved', lang)}</p>
            <p className="mt-1 font-display text-3xl font-bold text-leaf">
              {formatNum(savedSom, lang)} {t('som', lang)}
            </p>
            <p className="text-sm text-ink/60">{t('perSeason', lang)}</p>
          </div>
          {field.method === 'sprinkler' && extraIfDrip > 0 && (
            <div className="mt-3 rounded-3xl border border-water/30 bg-water/5 p-5 text-sm leading-relaxed">
              {fmt(t('switchToDrip', lang), formatNum(extraIfDrip, lang))}
            </div>
          )}
          {field.method === 'drip' && (
            <p className="mt-3 rounded-2xl bg-leaf-soft px-4 py-3 text-sm font-medium text-leaf">
              {t('alreadyBest', lang)}
            </p>
          )}
        </>
      )}

      <div className="canal my-6" aria-hidden />
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <span className="text-2xl" aria-hidden>🌊</span>
        <p className="text-sm leading-relaxed text-ink/70">{t('aralNote', lang)}</p>
      </div>

      <NationalImpact />
    </div>
  );
}
