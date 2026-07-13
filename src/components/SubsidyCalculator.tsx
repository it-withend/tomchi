import { useState } from 'react';
import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { seasonTotals, SOM_PER_M3, type FieldConfig } from '../engine/irrigation';
import { Icon } from './Icon';

const mln = (n: number, lang: 'uz' | 'ru') => `${formatNum(n / 1_000_000, lang)} ${t('mln', lang)}`;

export function SubsidyCalculator({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const [costPerHa, setCostPerHa] = useState(20_000_000); // so'm/ha, editable
  const [subsidy, setSubsidy] = useState(50); // %

  const tot = seasonTotals(field);
  // Water (m³) saved per season by moving from the current method to drip.
  const waterSavedYr = Math.max(0, tot.m3Field - tot.m3Drip);
  const moneySavedYr = waterSavedYr * SOM_PER_M3;
  const systemCost = costPerHa * field.areaHa;
  const netCost = systemCost * (1 - subsidy / 100);
  const paybackYears = moneySavedYr > 0 ? netCost / moneySavedYr : Infinity;
  const alreadyDrip = field.method === 'drip';

  return (
    <section className="mt-8">
      <div className="mb-1 flex items-center gap-2">
        <Icon name="calculator" size={20} className="text-water" />
        <h2 className="font-display text-lg font-medium text-ink">{t('calcTitle', lang)}</h2>
      </div>
      <p className="mb-4 text-sm text-ink/60">{t('calcSub', lang)}</p>

      {alreadyDrip ? (
        <div className="rounded-3xl border border-leaf/30 bg-leaf-soft p-5 text-sm leading-relaxed text-leaf">
          <Icon name="check" size={18} className="mb-1 inline" /> {t('calcAlreadyDrip', lang)}
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-card p-5">
          {/* inputs */}
          <label className="block text-sm text-ink/70">
            {t('calcSystemCost', lang)}: <b className="text-ink">{mln(costPerHa, lang)} {t('som', lang)}</b>
            <input type="range" min={8_000_000} max={40_000_000} step={1_000_000} value={costPerHa}
              onChange={(e) => setCostPerHa(+e.target.value)}
              className="mt-1 w-full accent-water" />
          </label>
          <label className="mt-3 block text-sm text-ink/70">
            {t('calcSubsidy', lang)}: <b className="text-ink">{subsidy}%</b>
            <input type="range" min={0} max={70} step={5} value={subsidy}
              onChange={(e) => setSubsidy(+e.target.value)}
              className="mt-1 w-full accent-water" />
          </label>

          <p className="mt-4 text-xs text-ink/50">{fmt(t('calcForField', lang), formatNum(field.areaHa, lang))}</p>

          {/* results */}
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <Stat label={t('calcNetCost', lang)} value={`${mln(netCost, lang)}`} unit={t('som', lang)} />
            <Stat label={t('calcAnnualSaving', lang)} value={`${mln(moneySavedYr, lang)}`} unit={t('som', lang)} accent />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-water-deep px-5 py-4 text-white">
            <span className="text-sm opacity-80">{t('calcPayback', lang)}</span>
            <span className="font-display text-3xl font-bold tabular-nums">
              {isFinite(paybackYears)
                ? paybackYears < 1
                  ? `${Math.round(paybackYears * 12)} ${t('calcMonths', lang)}`
                  : `${formatNum(paybackYears, lang)} ${t('calcYears', lang)}`
                : '—'}
            </span>
          </div>
          <p className="mt-2 text-center text-xs text-ink/40">{t('calcNote', lang)}</p>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-wash p-3">
      <p className="text-xs text-ink/50">{label}</p>
      <p className={`font-display text-xl font-bold ${accent ? 'text-leaf' : 'text-ink'}`}>{value}</p>
      <p className="text-[11px] text-ink/40">{unit}</p>
    </div>
  );
}
