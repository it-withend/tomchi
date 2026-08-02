import { useApp } from '../state';
import { t, formatNum } from '../i18n';
import type { SoilWater } from '../engine/soilWater';
import { Icon } from './Icon';

/**
 * The root zone drawn as what it is: a bucket. The fill is how much water the
 * soil still holds, and the marked line is the point past which the crop starts
 * to suffer — so "am I close to trouble" is one glance, not a number to decode.
 */
export function MoistureGauge({ water }: { water: SoilWater }) {
  const { lang } = useApp();
  if (!water.inSeason) return null;

  const fill = Math.max(0, Math.min(100, water.moisturePct));
  const stressLine = water.taw > 0 ? Math.round(100 * (1 - water.raw / water.taw)) : 0;
  const dry = water.needsIrrigation;

  return (
    <div className="flex items-stretch gap-4">
      {/* the bucket */}
      <div className="relative h-32 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-wash">
        <div
          className={`absolute inset-x-0 bottom-0 transition-[height] duration-500 ${dry ? 'bg-indigo' : 'bg-water'}`}
          style={{ height: `${fill}%` }}
        />
        <div
          className="absolute inset-x-0 border-t border-dashed border-ink/35"
          style={{ bottom: `${stressLine}%` }}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-3xl font-bold tnum text-water-deep">{fill}%</p>
        <p className="text-xs text-ink/55">{t('moistureLabel', lang)}</p>

        <p className={`mt-2 flex items-start gap-1.5 text-sm leading-snug ${dry ? 'font-medium text-indigo' : 'text-ink/70'}`}>
          {dry && <Icon name="alert" size={15} className="mt-0.5 shrink-0" />}
          {dry
            ? t('moistureDry', lang)
            : water.daysUntilIrrigation == null
              ? t('moistureOk', lang)
              : `${t('moistureDaysLeft', lang)}: ${water.daysUntilIrrigation}`}
        </p>

        <p className="mt-2 text-[11px] leading-relaxed text-ink/45">
          {t('rootDepthLabel', lang)} {formatNum(water.rootDepth, lang)} {t('metreShort', lang)} ·{' '}
          {t('capacityLabel', lang)} {formatNum(water.taw, lang)} {t('mmShort', lang)}
        </p>
      </div>
    </div>
  );
}

/** One-line version for the dashboard, so moisture is visible without a detour. */
export function MoistureBar({ water }: { water: SoilWater }) {
  const { lang } = useApp();
  if (!water.inSeason) return null;

  const fill = Math.max(0, Math.min(100, water.moisturePct));
  const dry = water.needsIrrigation;

  return (
    <div className="mt-3 rounded-xl bg-wash px-3 py-2.5 text-left">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-ink/50">{t('moistureLabel', lang)}</p>
        <p className={`text-sm font-medium tnum ${dry ? 'text-indigo' : 'text-water-deep'}`}>{fill}%</p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${dry ? 'bg-indigo' : 'bg-water'}`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
}
