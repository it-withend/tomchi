import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { t, fmt, formatNum, formatDate } from '../i18n';
import { ConnectTelegram } from './ConnectTelegram';
import { getTelegramLink, unlinkTelegram, type TelegramLink } from '../lib/sync';
import { dayStatus, getCrop, getRegion, nextWatering, lastEventDate, type FieldConfig } from '../engine/irrigation';
import { methodEfficiency } from '../data/crops';
import { useForecast } from '../useForecast';
import { dayFrom, nextRainDay, RAIN_SKIP_MM } from '../engine/weather';
import { openReport } from '../engine/report';
import { DropGauge } from './DropGauge';
import { Icon } from './Icon';
import { FieldNdvi } from './FieldNdvi';

export function Dashboard({ field }: { field: FieldConfig }) {
  const { lang, fields, setActiveFieldId, setAdding, logWatering, removeField, syncEnabled } = useApp();
  const [showConnect, setShowConnect] = useState(false);
  const [tgLink, setTgLink] = useState<TelegramLink | null>(null);
  const [tgChecked, setTgChecked] = useState(false);
  const s = dayStatus(field);
  const crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);
  const next = nextWatering(field);
  const forecast = useForecast(field.regionId);

  const today = dayFrom(forecast);
  const rainDay = nextRainDay(forecast);
  const live = today && today.et0 > 0;

  // If we have live ET0, scale today's need by the ratio to the climate norm
  const et0 = live ? today!.et0 : s.et0;
  const ratio = s.et0 > 0 ? et0 / s.et0 : 1;
  const liters = s.litersPerDay * ratio;

  // peak-season gross need for gauge scale
  const peakMm = Math.max(...region.et0) * Math.max(...crop.stages.map((x) => x.kc)) / methodEfficiency[field.method];
  const fill = s.inSeason && peakMm > 0 ? (s.grossMm * ratio) / peakMm : 0;

  const fert = crop.fertilizer.find((f) => f.stage === s.stage);
  const showM3 = liters >= 20000;
  const last = lastEventDate(field);
  const log = [...(field.log ?? [])].reverse().slice(0, 6);

  const addEvent = (type: 'watered' | 'rain') => logWatering(field.id, type);

  // Whether this device already receives bot reminders decides which action the
  // Telegram row offers: connect, or disconnect.
  const refreshTgLink = () => {
    if (!syncEnabled) { setTgChecked(true); return; }
    getTelegramLink().then((l) => { setTgLink(l); setTgChecked(true); });
  };
  useEffect(refreshTgLink, [syncEnabled]);

  const disconnectTg = async () => {
    if (!window.confirm(t('unlinkTgConfirm', lang))) return;
    if (await unlinkTelegram()) setTgLink(null);
  };

  const rainTodayHeavy = today && today.rainMm >= RAIN_SKIP_MM;

  // Urgency is carried by inversion, not by a warning colour: the card that
  // needs acting on today is the only solid one on the screen.
  const urgent = !!next && (next.overdue || next.daysLeft === 0);

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
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-water text-white' : 'border border-line bg-card text-ink/70'}`}>
              <Icon name={c.icon} size={15} />
              {c.name[lang]} · {formatNum(f.areaHa, lang)} {t('hectare', lang)}
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
          className="flex items-center gap-1 text-xs font-medium text-ink/45 transition-colors hover:text-ink/75">
          <Icon name="trash" size={13} /> {t('deleteField', lang)}
        </button>
      </div>

      {/* weather-aware rain advice */}
      {s.inSeason && rainDay && (
        <div className="mb-3 flex items-start gap-3 rounded-2xl border border-water/30 bg-water/5 p-3.5">
          <Icon name="rain" size={22} className="shrink-0 text-water-deep" />
          <p className="text-sm leading-snug text-water-deep">
            {rainTodayHeavy
              ? t('rainToday', lang)
              : fmt(t('rainInDays', lang), formatDate(new Date(rainDay.date), lang), formatNum(rainDay.rainMm, lang))}
          </p>
        </div>
      )}

      {/* signature gauge */}
      <section className="rounded-3xl border border-line bg-card px-5 pb-6 pt-7 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-display text-sm font-medium uppercase tracking-wider text-water-deep">
            {t('todayNeed', lang)}
          </h2>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${live ? 'bg-leaf-soft text-leaf' : 'bg-line text-ink/50'}`}>
            {live && <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden />}
            {live ? t('liveWeather', lang) : t('climateNormal', lang)}
          </span>
        </div>
        {s.inSeason ? (
          <>
            <DropGauge fill={fill} label={t('todayNeed', lang)} />
            <p className="mt-2 font-display text-4xl font-bold text-water-deep">
              {showM3 ? formatNum(liters / 1000, lang) : formatNum(liters, lang)}
            </p>
            <p className="text-sm text-ink/60">{showM3 ? t('m3PerDay', lang) : t('litersPerDay', lang)}</p>
            {today && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink/50">
                <Icon name="thermometer" size={13} /> {formatNum(today.tMax, lang)}° · {t('et0Label', lang)} {formatNum(et0, lang)} {t('mmDay', lang)}
              </p>
            )}

            {/* watering journal */}
            <div className={`mt-5 rounded-2xl p-4 text-left ${urgent ? 'bg-water-deep' : 'bg-wash'}`}>
              {last ? (
                next && next.daysLeft > 0 ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-ink/50">{t('daysToWatering', lang)}</p>
                      <p className="font-display text-2xl font-bold tnum text-water-deep">
                        {next.daysLeft} {t('daysShort', lang)}
                      </p>
                    </div>
                    <p className="max-w-[45%] text-right text-xs text-ink/50">
                      {t('lastWatered', lang)}: {formatDate(new Date(last), lang)}
                    </p>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 font-display text-base font-bold text-white">
                    <Icon name="bell" size={18} className="shrink-0" />
                    {next?.overdue ? t('overdue', lang) : t('waterToday', lang)}
                  </p>
                )
              ) : (
                <p className={`text-sm leading-relaxed ${urgent ? 'text-white/85' : 'text-ink/60'}`}>
                  {t('notWateredYet', lang)}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => addEvent('watered')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium active:scale-[0.98] ${
                    urgent ? 'bg-white text-water-deep' : 'bg-water text-white'}`}>
                  <Icon name="check" size={16} /> {t('iWatered', lang)}
                </button>
                <button onClick={() => addEvent('rain')} title={t('rainNote', lang)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-medium active:scale-[0.98] ${
                    urgent ? 'border-white/45 text-white' : 'border-water/40 bg-card text-water-deep'}`}>
                  <Icon name="rain" size={16} /> {t('itRained', lang)}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-left text-sm">
              <div className="rounded-xl bg-wash px-3 py-2.5">
                <p className="text-xs text-ink/50">{t('et0Label', lang)}</p>
                <p className="font-medium">{formatNum(et0, lang)} {t('mmDay', lang)}</p>
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
          <div className="ornament my-5" aria-hidden />

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

      {/* satellite field health */}
      <FieldNdvi field={field} />

      {/* watering history */}
      <section className="mt-5 rounded-2xl border border-line bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{t('history', lang)}</p>
          <button onClick={() => openReport(field, lang)}
            className="inline-flex items-center gap-1 rounded-full bg-water/10 px-3 py-1 text-xs font-medium text-water-deep">
            <Icon name="file" size={13} /> PDF
          </button>
        </div>
        {log.length ? (
          <ul className="mt-3 flex flex-col gap-1.5">
            {log.map((e, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icon name={e.type === 'rain' ? 'rain' : 'drop'} size={15} className="text-water" />
                  {e.type === 'rain' ? t('typeRain', lang) : t('typeWatered', lang)}
                </span>
                <span className="text-ink/50">{formatDate(new Date(e.date), lang)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/50">{t('noHistory', lang)}</p>
        )}
      </section>

      {/* Telegram reminders — connect, or disconnect once linked */}
      {syncEnabled && tgChecked && (
        tgLink ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-leaf/30 bg-leaf-soft p-4">
            <Icon name="send" size={24} className="shrink-0 text-leaf" />
            <span className="flex-1">
              <span className="block text-sm font-medium text-leaf">{t('tgLinked', lang)}</span>
              <span className="block text-xs text-ink/60">{t('tgLinkedDesc', lang)}</span>
            </span>
            <button onClick={disconnectTg}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink">
              <Icon name="unlink" size={13} /> {t('unlinkTg', lang)}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConnect(true)}
            className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-water/30 bg-water/5 p-4 text-left">
            <Icon name="send" size={24} className="shrink-0 text-water-deep" />
            <span className="flex-1">
              <span className="block text-sm font-medium text-water-deep">{t('connectTg', lang)}</span>
              <span className="block text-xs text-ink/60">{t('connectTgDesc', lang)}</span>
            </span>
            <Icon name="chevron" size={18} className="text-water-deep" />
          </button>
        )
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-ink/40">{t('methodology', lang)}</p>

      {showConnect && (
        <ConnectTelegram onClose={() => { setShowConnect(false); refreshTgLink(); }} />
      )}
    </div>
  );
}
