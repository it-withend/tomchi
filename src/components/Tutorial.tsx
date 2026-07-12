import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';

const slides = [
  { icon: '🧑‍🌾', titleKey: 'tut1Title', bodyKey: 'tut1Body' },
  { icon: '💧', titleKey: 'tut2Title', bodyKey: 'tut2Body' },
  { icon: '🌾', titleKey: 'tut3Title', bodyKey: 'tut3Body' },
  { icon: '📅', titleKey: 'tut4Title', bodyKey: 'tut4Body' },
  { icon: '🩺', titleKey: 'tut5Title', bodyKey: 'tut5Body' },
  { icon: '🌊', titleKey: 'tut6Title', bodyKey: 'tut6Body' },
];

export function Tutorial({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/60 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label={t('help', lang)}>
      <div className="mx-auto w-full max-w-md rounded-t-3xl bg-card px-6 pb-8 pt-6">
        <div className="flex justify-between">
          <div className="flex gap-1.5 pt-2">
            {slides.map((_, k) => (
              <div key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-water' : 'w-1.5 bg-line'}`} />
            ))}
          </div>
          <button onClick={onClose} className="text-sm font-medium text-ink/50">{t('tutSkip', lang)}</button>
        </div>
        <div className="mt-6 grid h-24 w-24 place-items-center rounded-3xl bg-wash text-5xl" aria-hidden>{s.icon}</div>
        <h3 className="mt-5 font-display text-xl font-medium text-ink">{t(s.titleKey, lang)}</h3>
        <p className="mt-2 min-h-20 leading-relaxed text-ink/70">{t(s.bodyKey, lang)}</p>
        <div className="mt-6 flex gap-3">
          {i > 0 && (
            <button onClick={() => setI(i - 1)}
              className="rounded-2xl border border-line px-5 py-3.5 font-medium text-water-deep">←</button>
          )}
          <button onClick={() => (last ? onClose() : setI(i + 1))}
            className="flex-1 rounded-2xl bg-water py-3.5 font-display text-base font-medium text-white">
            {last ? t('tutDone', lang) : t('next', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
