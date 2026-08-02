import { useState } from 'react';
import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { seasonTotals, SOM_PER_M3, POOL_M3, type FieldConfig } from '../engine/irrigation';
import { NationalImpact } from './NationalImpact';
import { Calculator } from './Calculator';
import { Icon } from './Icon';

export function Impact({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const [calc, setCalc] = useState(false);
  const tot = seasonTotals(field);
  const savedSom = tot.m3Saved * SOM_PER_M3;
  const pools = tot.m3Saved / POOL_M3;
  const extraIfDrip = Math.max(0, tot.m3Field - tot.m3Drip);
  const isDrip = field.method === 'drip';

  return (
    <div className="px-5 pb-28 pt-6 lg:max-w-2xl lg:pb-10 lg:pl-0 lg:pr-1 lg:pt-8">
      <h2 className="font-display text-lg font-medium text-ink">{t('impactTitle', lang)}</h2>
      <p className="mb-4 text-sm text-ink/60">{t('yourMethod', lang)}: {t(field.method, lang)}</p>

      {/* one compact benefit card */}
      <div className="rounded-3xl bg-water-deep p-6 text-white">
        <p className="text-sm opacity-80">{t('waterSavedSeason', lang)}</p>
        <p className="mt-1 font-display text-4xl font-bold">{formatNum(tot.m3Saved, lang)} <span className="text-2xl">m³</span></p>
        <p className="mt-0.5 text-sm opacity-80">{t('vsFlood', lang)}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm">
            <Icon name="coins" size={15} /> {formatNum(savedSom, lang)} {t('som', lang)}
          </span>
          {pools >= 1 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm">
              <Icon name="pool" size={16} /> {fmt(t('equalPools', lang), Math.round(pools))}
            </span>
          )}
        </div>

        {isDrip ? (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-leaf-soft">
            <Icon name="check" size={16} /> {t('alreadyBest', lang)}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-relaxed opacity-90">{fmt(t('switchToDrip', lang), formatNum(extraIfDrip, lang))}</p>
        )}
      </div>

      {!isDrip && (
        <button onClick={() => setCalc(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-water/40 bg-card py-3.5 text-sm font-medium text-water-deep">
          <Icon name="calculator" size={18} /> {t('calcOpen', lang)}
        </button>
      )}

      {/* Aral, kept small */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <Icon name="waves" size={22} className="mt-0.5 shrink-0 text-water" />
        <p className="text-sm leading-relaxed text-ink/70">{t('aralNote', lang)}</p>
      </div>

      <NationalImpact />

      {calc && <Calculator field={field} onClose={() => setCalc(false)} />}
    </div>
  );
}
