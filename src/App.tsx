import { useState } from 'react';
import { useApp } from './state';
import { t } from './i18n';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { Doctor } from './components/Doctor';
import { Impact } from './components/Impact';

type Tab = 'today' | 'calendar' | 'doctor' | 'impact';

const tabs: { id: Tab; labelKey: string; icon: string }[] = [
  { id: 'today', labelKey: 'tabToday', icon: '💧' },
  { id: 'calendar', labelKey: 'tabCalendar', icon: '📅' },
  { id: 'doctor', labelKey: 'tabDoctor', icon: '🩺' },
  { id: 'impact', labelKey: 'tabImpact', icon: '🌊' },
];

export default function App() {
  const { lang, setLang, field } = useApp();
  const [tab, setTab] = useState<Tab>('today');

  if (!field) return <div className="mx-auto max-w-md">{<Onboarding />}</div>;

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      {/* top bar */}
      <header className="flex items-center justify-between px-5 pt-5">
        <p className="font-display text-lg font-bold text-water-deep">
          {t('appName', lang)}
          <span className="ml-2 align-middle font-body text-[11px] font-normal tracking-wide text-clay">
            {t('tagline', lang)}
          </span>
        </p>
        <button
          onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
          className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-water-deep"
          aria-label={t('chooseLang', lang)}>
          {lang === 'uz' ? 'RU' : 'UZ'}
        </button>
      </header>

      <main>
        {tab === 'today' && <Dashboard field={field} />}
        {tab === 'calendar' && <CalendarView field={field} />}
        {tab === 'doctor' && <Doctor field={field} />}
        {tab === 'impact' && <Impact field={field} />}
      </main>

      {/* bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        aria-label="Navigation">
        <div className="mx-auto flex max-w-md">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              aria-current={tab === tb.id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${tab === tb.id ? 'text-water-deep' : 'text-ink/40'}`}>
              <span className={`text-xl leading-none ${tab === tb.id ? '' : 'grayscale opacity-60'}`} aria-hidden>{tb.icon}</span>
              {t(tb.labelKey, lang)}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
