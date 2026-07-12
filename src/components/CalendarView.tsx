import { useApp } from '../state';
import { t, formatNum } from '../i18n';
import { seasonCalendar, getCrop, type FieldConfig } from '../engine/irrigation';

const monthNames = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};

const stageColor: Record<string, string> = {
  initial: 'bg-leaf-soft text-leaf',
  development: 'bg-water/10 text-water-deep',
  mid: 'bg-clay-soft text-clay',
  late: 'bg-line text-ink/60',
};

export function CalendarView({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const rows = seasonCalendar(field);
  const crop = getCrop(field.cropId);
  const max = Math.max(...rows.map((r) => r.m3PerHa), 1);
  const total = rows.reduce((s, r) => s + r.m3Field, 0);
  const nowMonth = new Date().getMonth();

  return (
    <div className="px-5 pb-28 pt-6">
      <h2 className="font-display text-lg font-medium text-ink">{t('seasonCalendar', lang)}</h2>
      <p className="mb-5 text-sm text-ink/60">{crop.emoji} {crop.name[lang]}</p>

      <div className="rounded-3xl border border-line bg-card p-4 shadow-sm">
        {rows.map((r) => (
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
            <span className="w-20 text-right text-sm tabular-nums text-ink/80">
              {r.m3PerHa > 0 ? `${formatNum(r.m3PerHa, lang)}` : '—'}
            </span>
          </div>
        ))}
        <p className="mt-2 pr-2 text-right text-xs text-ink/40">{t('m3ha', lang)}</p>
      </div>

      {/* stage legend actually maps colors used on dashboard */}
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
