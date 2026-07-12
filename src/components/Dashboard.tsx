import { useApp } from '../state';
import { t, fmt, formatNum, formatDate } from '../i18n';
import { dayStatus, getCrop, getRegion, nextWatering, type FieldConfig } from '../engine/irrigation';
import { methodEfficiency } from '../data/crops';
import { DropGauge } from './DropGauge';

export function Dashboard({ field }: { field: FieldConfig }) {
  const { lang, fields, setActiveFieldId, setAdding, updateField, removeField } = useApp();
  const s = dayStatus(field);
  const crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);
  const next = nextWatering(field);

  // peak-season gross need for gauge scale
  const peakMm = Math.max(...region.et0) * Math.max(...crop.stages.map((x) => x.kc)) / methodEfficiency[field.method];
  const fill = s.inSeason && peakMm > 0 ? s.grossMm / peakMm : 0;

  const fert = crop.fertilizer.find((f) => f.stage === s.stage);
  const liters = s.litersPerDay;
  const showM3 = liters >= 20000;

  const markWatered = () => updateField(field.id, { lastWatered: new Date().toISOString() });

  return (
    <div className="px-5 pb-28 pt-4">
      {/* field switcher */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('myField', lang)}>
        {fields.map((f) => {
          const c = getCrop(f.cropId);
          const active = f.id === field.id;
          return (
            <button key={f.id} role="tab" aria-selected={active}
              onClick={() => setActiveFieldId(f.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-water text-white' : 'border border-line bg-card text-ink/70'}`}>
              {c.emoji} {c.name[lang]} · {formatNum(f.areaHa, lang)} {t('hectare', lang)}
            </button>
          );
        })}
        <button onClick={() => setAdding(true)}
          className="shrink-0 rounded-full border border-dashed border-water/50 px-4 py-2 text-sm font-medium text-water-deep">
          {t('addField', lang)}
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/60">{region.name[lang]}</p>
        <button onClick={() => { if (window.confirm(t('deleteField', lang) + '?')) removeField(field.id); }}
          className="text-xs font-medium text-clay">{t('deleteField', lang)}</button>
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

            {/* watering journal */}
            <div className={`mt-5 rounded-2xl p-4 text-left ${next && (next.overdue || next.daysLeft === 0) ? 'bg-clay-soft' : 'bg-wash'}`}>
              {field.lastWatered ? (
                next && next.daysLeft > 0 ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-ink/50">{t('daysToWatering', lang)}</p>
                      <p className="font-display text-2xl font-bold text-water-deep">
                        {next.daysLeft} {t('daysShort', lang)}
                      </p>
                    </div>
                    <p className="max-w-[45%] text-right text-xs text-ink/50">
                      {t('lastWatered', lang)}: {formatDate(new Date(field.lastWatered), lang)}
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-clay">{next?.overdue ? t('overdue', lang) : t('waterToday', lang)}</p>
                )
              ) : (
                <p className="text-sm leading-relaxed text-ink/60">{t('notWateredYet', lang)}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={markWatered}
                  className="flex-1 rounded-xl bg-water py-3 text-sm font-medium text-white active:scale-[0.98]">
                  {t('iWatered', lang)}
                </button>
                <button onClick={markWatered} title={t('rainNote', lang)}
                  className="flex-1 rounded-xl border border-water/40 bg-card py-3 text-sm font-medium text-water-deep active:scale-[0.98]">
                  {t('itRained', lang)}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-left text-sm">
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

          {/* stage + interval */}
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
              <p className="text-xs text-ink/50">{t('intervalLabel', lang)}</p>
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
