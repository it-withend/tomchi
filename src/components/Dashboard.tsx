import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { dayStatus, getCrop, getRegion, type FieldConfig } from '../engine/irrigation';
import { methodEfficiency } from '../data/crops';
import { DropGauge } from './DropGauge';

const methodKey = { furrow: 'furrow', sprinkler: 'sprinkler', drip: 'drip' } as const;

export function Dashboard({ field }: { field: FieldConfig }) {
  const { lang, setField } = useApp();
  const s = dayStatus(field);
  const crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);

  // peak-season gross need for gauge scale
  const peakMm = Math.max(...region.et0) * Math.max(...crop.stages.map((x) => x.kc)) / methodEfficiency[field.method];
  const fill = s.inSeason && peakMm > 0 ? s.grossMm / peakMm : 0;

  const fert = crop.fertilizer.find((f) => f.stage === s.stage);
  const liters = s.litersPerDay;
  const showM3 = liters >= 20000;

  return (
    <div className="px-5 pb-28 pt-6">
      {/* field summary */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{t('myField', lang)}</p>
          <p className="font-medium">
            {crop.emoji} {crop.name[lang]} · {formatNum(field.areaHa, lang)} {t('hectare', lang)} · {region.name[lang]}
          </p>
        </div>
        <button onClick={() => setField(null)}
          className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-water-deep">
          {t('edit', lang)}
        </button>
      </div>

      {/* signature gauge */}
      <section className="rounded-3xl border border-line bg-card px-5 pb-6 pt-7 text-center shadow-sm">
        <h2 className="font-display text-sm font-medium uppercase tracking-wider text-water-deep">
          {t('todayNeed', lang)}
        </h2>
        {s.inSeason ? (
          <>
            <DropGauge fill={fill} label={t('todayNeed', lang)} />
            <p className="mt-2 font-display text-4xl font-bold text-water-deep">
              {showM3 ? formatNum(liters / 1000, lang) : formatNum(liters, lang)}
            </p>
            <p className="text-sm text-ink/60">{showM3 ? t('m3PerDay', lang) : t('litersPerDay', lang)}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
              <div className="rounded-xl bg-wash px-3 py-2.5">
                <p className="text-xs text-ink/50">{t('et0Label', lang)}</p>
                <p className="font-medium">{formatNum(s.et0, lang)} {t('mmDay', lang)}</p>
              </div>
              <div className="rounded-xl bg-wash px-3 py-2.5">
                <p className="text-xs text-ink/50">{t('kcLabel', lang)}</p>
                <p className="font-medium">{formatNum(s.kc, lang)}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="mx-auto mt-4 max-w-xs leading-relaxed text-ink/60">{t('offSeason', lang)}</p>
        )}
      </section>

      {s.inSeason && (
        <>
          <div className="canal my-5" aria-hidden />

          {/* stage + next watering */}
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs text-ink/50">{t('stageNow', lang)}</p>
              <p className="mt-1 font-medium leading-snug">{t('stage_' + s.stage, lang)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-leaf" style={{ width: `${(s.daysIntoSeason / s.seasonLength) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink/40">{s.daysIntoSeason} / {s.seasonLength}</p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs text-ink/50">{t('nextWatering', lang)}</p>
              <p className="mt-1 font-medium">{fmt(t('everyNDays', lang), s.intervalDays)}</p>
              <p className="mt-2 text-xs text-ink/50">{t('waterPerIrrigation', lang)}</p>
              <p className="text-sm font-medium text-water-deep">
                {formatNum(s.litersPerIrrigation / 1000, lang)} m³
              </p>
            </div>
          </section>

          {/* fertilizer advice */}
          {fert && (
            <section className="mt-3 rounded-2xl border border-leaf/30 bg-leaf-soft p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-leaf">{t('fertilizer', lang)}</p>
              <p className="mt-1 text-sm leading-relaxed">{fert.text[lang]}</p>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-ink/40">{t('methodology', lang)}</p>
    </div>
  );
}
