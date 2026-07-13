import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { getCrop, type FieldConfig } from '../engine/irrigation';
import { cropPrices, getPrice, PRICE_UPDATED } from '../data/prices';
import { Icon } from './Icon';

const monthLabel = (ym: string, lang: 'uz' | 'ru') => {
  const names = {
    uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
    ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  };
  const [y, m] = ym.split('-').map(Number);
  return `${names[lang][m - 1]} ${y}`;
};

const trendKey = (tr: string) => (tr === 'up' ? 'trendUp' : tr === 'down' ? 'trendDown' : 'trendFlat');

export function CropPrices({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const mine = getPrice(field.cropId);
  const others = cropPrices.filter((p) => p.cropId !== field.cropId);

  return (
    <section className="mt-8">
      <div className="mb-1 flex items-center gap-2">
        <Icon name="tag" size={20} className="text-water" />
        <h2 className="font-display text-lg font-medium text-ink">{t('pricesTitle', lang)}</h2>
      </div>
      <p className="mb-4 text-sm text-ink/60">{t('pricesSub', lang)}</p>

      {/* Your crop — featured */}
      {mine && (() => {
        const crop = getCrop(mine.cropId);
        return (
          <div className="rounded-3xl bg-water-deep p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-lg font-medium">
                <span aria-hidden>{crop.emoji}</span> {crop.name[lang]}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{t(trendKey(mine.trend), lang)}</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">
              {formatNum(mine.low, lang)}–{formatNum(mine.high, lang)}
            </p>
            <p className="text-sm opacity-80">{t('pricePerKg', lang)}</p>
            <div className="mt-3 rounded-2xl bg-white/10 p-3 text-sm leading-snug">
              <span className="font-medium">{t('sellAdvice', lang)}:</span> {mine.sell[lang]}
            </div>
          </div>
        );
      })()}

      {/* Other crops — compact list */}
      <div className="mt-3 divide-y divide-line rounded-3xl border border-line bg-card">
        {others.map((p) => {
          const crop = getCrop(p.cropId);
          return (
            <div key={p.cropId} className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <span aria-hidden>{crop.emoji}</span> {crop.name[lang]}
              </span>
              <span className="text-sm tabular-nums text-ink/70">
                {formatNum(p.low, lang)}–{formatNum(p.high, lang)} <span className="text-xs text-ink/40">{t('pricePerKg', lang)}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-ink/40">{fmt(t('priceIndicative', lang), monthLabel(PRICE_UPDATED, lang))}</p>
    </section>
  );
}
