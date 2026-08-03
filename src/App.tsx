import { lazy, Suspense, useEffect, useState } from 'react';
import { useApp } from './state';
import { t, formatNum } from './i18n';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ControlPanel } from './components/ControlPanel';
import { Tutorial } from './components/Tutorial';
import { Splash } from './components/Splash';
import { getCrop } from './engine/irrigation';
import { Icon, type IconName } from './components/Icon';

// Today and the irrigation control are the reason the app is opened, so they
// ship in the first bundle. The other three are a tap away and each drags
// something bulky behind it — the chat transcript and photo pipeline, the month
// tables, the outline map of Uzbekistan — which a farmer on a rural connection
// should not have to wait for before seeing today's water figure.
const CalendarView = lazy(() => import('./components/CalendarView').then((m) => ({ default: m.CalendarView })));
const Doctor = lazy(() => import('./components/Doctor').then((m) => ({ default: m.Doctor })));
const Impact = lazy(() => import('./components/Impact').then((m) => ({ default: m.Impact })));

type Tab = 'today' | 'control' | 'calendar' | 'agronom' | 'impact';

const tabs: { id: Tab; labelKey: string; icon: IconName }[] = [
  { id: 'today', labelKey: 'tabToday', icon: 'drop' },
  { id: 'control', labelKey: 'tabControl', icon: 'tap' },
  { id: 'calendar', labelKey: 'tabCalendar', icon: 'calendar' },
  { id: 'agronom', labelKey: 'tabAgronom', icon: 'sparkles' },
  { id: 'impact', labelKey: 'tabImpact', icon: 'waves' },
];

/** Placeholder while a tab's chunk arrives: card-shaped, so the page does not
 *  jump when the real content replaces it. */
function TabLoading() {
  return (
    <div className="px-5 pt-5" aria-hidden>
      <div className="h-40 animate-pulse rounded-3xl border border-line bg-card" />
      <div className="mt-4 h-24 animate-pulse rounded-3xl border border-line bg-card" />
    </div>
  );
}

export default function App() {
  const {
    lang, setLang, fields, activeField, setActiveFieldId, setAdding,
    adding, tutorialSeen, setTutorialSeen,
  } = useApp();
  const [tab, setTab] = useState<Tab>('today');
  const [showHelp, setShowHelp] = useState(false);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  if (splash) return <Splash onDone={() => setSplash(false)} />;

  if (!activeField || adding) return <div className="mx-auto max-w-md"><Onboarding key={adding ? 'add' : 'first'} /></div>;

  const tutorialOpen = !tutorialSeen || showHelp;

  return (
    // Phones keep the single narrow column and the thumb-reachable tab bar.
    // From `lg` up the same screens sit beside a standing sidebar instead, so a
    // desktop gets a workspace rather than a phone stretched down the middle.
    <div className="mx-auto min-h-dvh max-w-md lg:flex lg:max-w-6xl lg:gap-10 lg:px-8">

      {/* desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:py-8">
        <p className="flex items-baseline gap-2 font-display text-xl font-bold text-water-deep">
          <img src="/tomchi.png" alt="" className="h-8 w-8 self-center rounded-lg" aria-hidden />
          {t('appName', lang)}
        </p>
        <p className="mt-1 pl-10 font-body text-[11px] tracking-wide text-water-dim">{t('tagline', lang)}</p>

        <nav className="mt-8 flex flex-col gap-1" aria-label={t('navSections', lang)}>
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              aria-current={tab === tb.id ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === tb.id ? 'bg-water text-white' : 'text-ink/60 hover:bg-card hover:text-water-deep'}`}>
              <Icon name={tb.icon} size={19} strokeWidth={tab === tb.id ? 2.4 : 2} />
              {t(tb.labelKey, lang)}
            </button>
          ))}
        </nav>

        {/* fields live in the sidebar on desktop, where there is room for them */}
        {fields.length > 0 && (
          <div className="mt-8 border-t border-line pt-5">
            <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-ink/40">
              {t('myField', lang)}
            </p>
            <div className="mt-2 flex flex-col gap-0.5">
              {fields.map((f) => {
                const c = getCrop(f.cropId);
                const active = f.id === activeField.id;
                return (
                  <button key={f.id} onClick={() => setActiveFieldId(f.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-card font-medium text-water-deep' : 'text-ink/60 hover:bg-card/60'}`}>
                    <Icon name={c.icon} size={16} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{c.name[lang]}</span>
                    <span className="shrink-0 text-xs tnum text-ink/40">
                      {formatNum(f.areaHa, lang)} {t('hectare', lang)}
                    </span>
                  </button>
                );
              })}
              <button onClick={() => setAdding(true)}
                className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-water-deep hover:bg-card/60">
                <Icon name="plus" size={16} className="shrink-0" /> {t('addField', lang)}
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-6">
          <button onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-water-deep"
            aria-label={t('help', lang)}>
            <Icon name="help" size={14} /> {t('help', lang)}
          </button>
          <button onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-water-deep"
            aria-label={t('chooseLang', lang)}>
            {lang === 'uz' ? 'RU' : 'UZ'}
          </button>
        </div>
      </aside>

      <div className="lg:min-w-0 lg:flex-1">
        {/* mobile top bar — the sidebar carries all of this on desktop */}
        <header className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <p className="flex items-baseline gap-2 font-display text-lg font-bold text-water-deep">
            <img src="/tomchi.png" alt="" className="h-7 w-7 self-center rounded-lg" aria-hidden />
            {t('appName', lang)}
            <span className="font-body text-[11px] font-normal tracking-wide text-water-dim">
              {t('tagline', lang)}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="grid h-7 w-7 place-items-center rounded-full border border-line bg-card text-water-deep"
              aria-label={t('help', lang)}>
              <Icon name="help" size={16} />
            </button>
            <button
              onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
              className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-water-deep"
              aria-label={t('chooseLang', lang)}>
              {lang === 'uz' ? 'RU' : 'UZ'}
            </button>
          </div>
        </header>

        <main>
          {tab === 'today' && <Dashboard field={activeField} />}
          {tab === 'control' && <ControlPanel key={activeField.id} field={activeField} />}
          <Suspense fallback={<TabLoading />}>
            {tab === 'calendar' && <CalendarView field={activeField} />}
            {tab === 'agronom' && <Doctor key={activeField.id + activeField.cropId} field={activeField} />}
            {tab === 'impact' && <Impact field={activeField} />}
          </Suspense>
        </main>
      </div>

      {tutorialOpen && (
        <Tutorial onClose={() => { setTutorialSeen(true); setShowHelp(false); }} />
      )}

      {/* bottom tab bar — phones only */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label={t('navSections', lang)}>
        <div className="mx-auto flex max-w-md">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              aria-current={tab === tb.id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${tab === tb.id ? 'text-water' : 'text-ink/40'}`}>
              <Icon name={tb.icon} size={23} strokeWidth={tab === tb.id ? 2.4 : 2} />
              {t(tb.labelKey, lang)}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
