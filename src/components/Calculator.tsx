import { useState } from 'react';
import { useApp } from '../state';
import { t, formatNum } from '../i18n';
import { seasonTotals, SOM_PER_M3, type FieldConfig } from '../engine/irrigation';
import { Icon } from './Icon';

// Rough default install cost for drip per hectare in Uzbekistan (editable).
const DEFAULT_COST_HA = 12_000_000;
const DEFAULT_SUBSIDY = 50;

export function Calculator({ field, onClose }: { field: FieldConfig; onClose: () => void }) {
  const { lang } = useApp();
  const [costHa, setCostHa] = useState(DEFAULT_COST_HA);
  const [subsidy, setSubsidy] = useState(DEFAULT_SUBSIDY);

  const tot = seasonTotals(field);
  // Water saved per season by moving this field to drip (vs its current method).
  const waterSaved = Math.max(0, tot.m3Field - tot.m3Drip);
  const moneyPerYear = waterSaved * SOM_PER_M3;
  const gross = costHa * field.areaHa;
  const net = Math.round(gross * (1 - subsidy / 100));
  const payback = moneyPerYear > 0 ? net / moneyPerYear : Infinity;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-wash px-5 pb-8 pt-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-base font-medium text-ink">
            <Icon name="calculator" size={20} className="text-water-deep" /> {t('calcTitle', lang)}
          </h3>
          <button onClick={onClose} className="text-sm font-medium text-ink/50">{t('close', lang)}</button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-ink/50">{t('calcNote', lang)}</p>

        {/* inputs */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-line bg-card p-4">
            <label className="text-xs text-ink/50">{t('calcCostHa', lang)}</label>
            <input type="number" inputMode="numeric" value={costHa}
              onChange={(e) => setCostHa(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full border-b-2 border-water bg-transparent pb-1 font-display text-2xl font-bold text-water-deep outline-none" />
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs text-ink/50">{t('calcSubsidy', lang)}</label>
              <span className="font-display text-lg font-bold text-leaf">{subsidy}%</span>
            </div>
            <input type="range" min={0} max={80} step={5} value={subsidy}
              onChange={(e) => setSubsidy(Number(e.target.value))}
              className="mt-2 w-full accent-water" />
          </div>
        </div>

        {/* results */}
        <div className="mt-4 rounded-3xl bg-water-deep p-5 text-white">
          <div className="flex items-baseline justify-between">
            <span className="text-sm opacity-80">{t('calcPayback', lang)}</span>
            <span className="font-display text-3xl font-bold">
              {payback === Infinity ? '—' : `${formatNum(Math.round(payback * 10) / 10, lang)} ${t('calcSeasons', lang)}`}
            </span>
          </div>
          <div className="mt-3 h-px bg-white/15" />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="opacity-70">{t('calcNetCost', lang)}</p>
              <p className="font-display text-lg font-bold">{formatNum(net, lang)} <span className="text-xs">{t('som', lang)}</span></p>
            </div>
            <div>
              <p className="opacity-70">{t('calcAnnualSave', lang)}</p>
              <p className="font-display text-lg font-bold text-leaf-soft">{formatNum(moneyPerYear, lang)} <span className="text-xs">{t('som', lang)}</span></p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs opacity-80">
            <Icon name="drop" size={13} /> {t('calcSaveWater', lang)}: {formatNum(waterSaved, lang)} m³ / {t('perSeason', lang)}
          </p>
        </div>
      </div>
    </div>
  );
}
