import { useApp } from '../state';
import { t, formatNum } from '../i18n';
import { seasonCalendar, getCrop, upcomingWaterings, dayStatus, type FieldConfig } from '../engine/irrigation';

const monthNames = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};

const weekdayNames = {
  uz: ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
};

const stageColor: Record<string, string> = {
  initial: 'bg-leaf-soft text-leaf',
  development: 'bg-water/10 text-water-deep',
  mid: 'bg-clay-soft text-clay',
  late: 'bg-line text-ink/60',
};

function dateLabel(d: Date, lang: 'uz' | 'ru'): string {
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((d0.getTime() - t0.getTime()) / 86400000);
  if (diff === 0) return t('today', lang);
  if (diff === 1) return t('tomorrow', lang);
  return `${d.getDate()} ${monthNames[lang][d.getMonth()].toLowerCase()}, ${weekdayNames[lang][d.getDay()]}`;
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

  return (
    <div className="px-5 pb-28 pt-6">
      <h2 className="font-display text-lg font-medium text-ink">{t('seasonCalendar', lang)}</h2>
      <p className="mb-5 text-sm text-ink/60">{crop.emoji} {crop.name[lang]}</p>

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
                    <span aria-hidden>💧</span> {dateLabel(d, lang)}
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
              className={`flex items-center gap-3 rounded-xl px-2 py-2 ${r.month === nowMonth ? 'bg-wash' : ''}`}>
              <span className={`w-9 text-sm ${r.month === nowMonth ? 'font-bold text-water-deep' : 'text-ink/60'}`}>
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

      {/* stage legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(['initial', 'development', 'mid', 'late'] as const).map((k) => (
          <span key={k} className={`rounded-full px-3 py-1 text-xs font-medium ${stageColor[k]}`}>
            {t('stage_' + k, lang)}
          </span>
        ))}
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
