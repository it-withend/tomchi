import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { randomTip } from '../data/tips';

/** Game-style loading splash: logo + a rotating farming tip, auto-dismisses. */
export function Splash({ onDone }: { onDone: () => void }) {
  const { lang } = useApp();
  const [tip] = useState(randomTip);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2000);
    const t2 = setTimeout(onDone, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-water-deep px-8 text-center transition-opacity duration-400 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <img src="/tomchi.png" alt="Tomchi" className="h-24 w-24 animate-pulse rounded-3xl shadow-2xl" />
      <h1 className="mt-5 font-display text-3xl font-bold text-white">Tomchi</h1>
      <p className="mt-1 font-display text-sm text-white/70">
        {lang === 'uz' ? 'Har bir tomchi hisobda' : 'Каждая капля на счету'}
      </p>

      <div className="mt-10 max-w-sm rounded-2xl bg-white/10 px-5 py-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/50">
          {lang === 'uz' ? 'Maslahat' : 'Совет'}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/90">{tip[lang]}</p>
      </div>

      {/* loading bar */}
      <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/15">
        <div className="h-full animate-[load_2s_ease-in-out] rounded-full bg-white/70" style={{ width: '100%' }} />
      </div>
      <style>{`@keyframes load { from { width: 0 } to { width: 100% } }`}</style>
    </div>
  );
}
