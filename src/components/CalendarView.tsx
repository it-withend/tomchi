import { useApp } from '../state';
import { t, formatNum } from '../i18n';
import { seasonCalendar, getCrop, upcomingWaterings, dayStatus, type FieldConfig } from '../engine/irrigation';
import type { Crop, StageKey } from '../data/crops';
import { Icon } from './Icon';

const monthNames = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};

const weekdayNames = {
  uz: ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
};

// Solid dot colour per stage — reused on each month row and in the legend so a
// farmer can match "which colour is which phase" at a glance.
const stageDot: Record<StageKey, string> = {
  initial: 'bg-leaf',
  development: 'bg-water',
  mid: 'bg-indigo',
  late: 'bg-ink/40',
};

/** Calendar date span of each growth stage, from planting + FAO-56 stage lengths. */
function stageRanges(crop: Crop, year: number): { key: StageKey; start: Date; end: Date }[] {
  const start = new Date(year, crop.plantMonth, 1);
  let offset = 0;
  return crop.stages.map((st) => {
    const s = new Date(start); s.setDate(s.getDate() + offset);
    const e = new Date(start); e.setDate(e.getDate() + offset + st.days - 1);
    offset += st.days;
    return { key: st.key, start: s, end: e };
  });
}

function dateLabel(d: Date, lang: 'uz' | 'ru'): string {
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((d0.getTime() - t0.getTime()) / 86400000);
  if (diff === 0) return t('today', lang);
  if (diff === 1) return t('tomorrow', lang);
  return `${d.getDate()} ${monthNames[lang][d.getMonth()].toLowerCase()}, ${weekdayNames[lang][d.getDay()]}`;
}

function dayMonth(d: Date, lang: 'uz' | 'ru'): string {
  return `${d.getDate()} ${monthNames[lang][d.getMonth()].toLowerCase()}`;
}

export function CalendarView({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const rows = seasonCalendar(field);
  const crop = getCrop(field.cropId);
  const max = Math.max(...rows.map((r) => r.m3PerHa), 1);
  const total = rows.reduce((s, r) => s + r.m3Field, 0);
  const nowMonth = new Date().getMonth();
  const upcoming = upcomingWaterings(field, 5);
  const s = dayStatus(field);
  const ranges = stageRanges(crop, new Date().getFullYear());

  return (
    <div className="px-5 pb-28 pt-6 lg:max-w-2xl lg:pb-10 lg:pl-0 lg:pr-1 lg:pt-8">
      <h2 className="font-display text-lg font-medium text-ink">{t('seasonCalendar', lang)}</h2>
      <p className="mb-5 flex items-center gap-1.5 text-sm text-ink/60">
        <Icon name={crop.icon} size={16} className="text-water-deep" /> {crop.name[lang]}
      </p>

      {/* concrete upcoming dates — what a farmer actually asks */}
      {upcoming.length > 0 && (
        <section className="mb-4 rounded-3xl border border-line bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-water-deep">{t('upcoming', lang)}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {upcoming.map((d, i) => {
              const st = dayStatus(field, d);
              return (
                <li key={i} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${i === 0 ? 'bg-water text-white' : 'bg-wash'}`}>
                  <span className="flex items-center gap-2 font-medium">
                    <Icon name="drop" size={15} /> {dateLabel(d, lang)}
                  </span>
                  <span className={`text-sm ${i === 0 ? 'text-white/80' : 'text-ink/60'}`}>
                    {formatNum(st.litersPerIrrigation / 1000, lang)} m³
                  </span>
                </li>
              );
            })}
          </ul>
          {s.inSeason && (
            <p className="mt-3 text-xs text-ink/50">
              {t('intervalLabel', lang)}: {s.intervalDays} {t('daysShort', lang)} · {t('stage_' + s.stage, lang)}
            </p>
          )}
        </section>
      )}

      <div className="rounded-3xl border border-line bg-card p-4 shadow-sm">
        {rows.map((r) => {
          return (
            <div key={r.month}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-2 ${r.month === nowMonth ? 'bg-wash' : ''}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${r.stage !== 'off' ? stageDot[r.stage] : 'bg-line'}`}
                title={r.stage !== 'off' ? t('stage_' + r.stage, lang) : t('stage_off', lang)} />
              <span className={`w-8 text-sm ${r.month === nowMonth ? 'font-bold text-water-deep' : 'text-ink/60'}`}>
                {monthNames[lang][r.month]}
              </span>
              <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-wash">
                {r.m3PerHa > 0 && (
                  <div className="h-full rounded-full bg-gradient-to-r from-water-dim to-water"
                    style={{ width: `${Math.max(4, (r.m3PerHa / max) * 100)}%` }} />
                )}
              </div>
              <span className="w-24 text-right text-xs tabular-nums text-ink/70">
                {r.m3PerHa > 0
                  ? `${formatNum(r.m3PerHa, lang)} ${t('m3ha', lang)}`
                  : '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* stage legend — explains what each phase means and when it happens */}
      <div className="mt-4 rounded-3xl border border-line bg-card p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-water-deep">{t('stageLegendTitle', lang)}</p>
        <ul className="mt-3 flex flex-col gap-3.5">
          {ranges.map((r) => (
            <li key={r.key} className="flex gap-3">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${stageDot[r.key]}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {t('stage_' + r.key, lang)}
                  <span className="ml-2 text-xs font-normal text-ink/45">
                    {dayMonth(r.start, lang)} – {dayMonth(r.end, lang)}
                  </span>
                </p>
                <p className="text-xs leading-snug text-ink/60">{t('stageDesc_' + r.key, lang)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-2xl bg-water-deep p-5 text-white">
        <p className="text-sm opacity-80">{t('seasonTotal', lang)} · {t('forYourField', lang)}</p>
        <p className="mt-1 font-display text-3xl font-bold">{formatNum(total, lang)} m³</p>
        <p className="mt-0.5 text-sm opacity-80">
          {formatNum(field.areaHa, lang)} {t('hectare', lang)}
        </p>
      </div>
    </div>
  );
}
