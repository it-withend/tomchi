import { useState } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';
import { regions } from '../data/regions';
import { crops, type Method } from '../data/crops';
import type { Soil } from '../engine/irrigation';

const methods: { id: Method; labelKey: string; descKey: string; icon: string }[] = [
  { id: 'furrow', labelKey: 'furrow', descKey: 'furrowDesc', icon: '〰️' },
  { id: 'sprinkler', labelKey: 'sprinkler', descKey: 'sprinklerDesc', icon: '🌧️' },
  { id: 'drip', labelKey: 'drip', descKey: 'dripDesc', icon: '💧' },
];

const soils: { id: Soil; labelKey: string; descKey: string; icon: string }[] = [
  { id: 'sandy', labelKey: 'soil_sandy', descKey: 'soil_sandyDesc', icon: '🏜️' },
  { id: 'loam', labelKey: 'soil_loam', descKey: 'soil_loamDesc', icon: '🟫' },
  { id: 'clay', labelKey: 'soil_clay', descKey: 'soil_clayDesc', icon: '🧱' },
];

const TOTAL_STEPS = 5;

export function Onboarding() {
  const { lang, setLang, addField, fields, adding, setAdding } = useApp();
  const [step, setStep] = useState(adding ? 1 : 0);
  const [regionId, setRegionId] = useState('');
  const [cropId, setCropId] = useState('');
  const [area, setArea] = useState('1');
  const [method, setMethod] = useState<Method | ''>('');
  const [soil, setSoil] = useState<Soil | ''>('');

  const areaNum = parseFloat(area.replace(',', '.'));
  const areaOk = !isNaN(areaNum) && areaNum >= 0.01 && areaNum <= 500;

  const Header = ({ title }: { title: string }) => (
    <div className="mb-5">
      <div className="mb-3 flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} aria-label={t('back', lang)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card text-water-deep">←</button>
        )}
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-water' : 'bg-line'}`} />
          ))}
        </div>
        {adding && fields.length > 0 && (
          <button onClick={() => setAdding(false)}
            className="text-sm font-medium text-water-deep">{t('cancel', lang)}</button>
        )}
      </div>
      <h2 className="font-display text-xl font-medium text-ink">{title}</h2>
    </div>
  );

  if (step === 0) {
    return (
      <div className="flex min-h-dvh flex-col justify-between px-6 py-10">
        <div className="flex gap-2 self-end" role="group" aria-label={t('chooseLang', lang)}>
          {(['uz', 'ru'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${lang === l ? 'bg-water text-white' : 'border border-line bg-card text-water-deep'}`}>
              {l === 'uz' ? "O'zbekcha" : 'Русский'}
            </button>
          ))}
        </div>
        <div>
          <svg viewBox="0 0 80 100" className="mb-6 h-24 w-auto" aria-hidden>
            <path d="M40 4 C40 4 12 42 12 64 a28 28 0 0 0 56 0 C68 42 40 4 40 4 Z" fill="#0f7ba0" />
            <path d="M40 22 C40 22 22 48 22 63 a18 18 0 0 0 36 0 C58 48 40 22 40 22 Z" fill="#7fc3dc" />
            <circle cx="33" cy="66" r="5" fill="#ffffff" opacity="0.9" />
          </svg>
          <h1 className="font-display text-4xl font-bold leading-tight text-water-deep">{t('appName', lang)}</h1>
          <p className="mt-1 font-display text-sm text-clay">{t('tagline', lang)}</p>
          <h2 className="mt-6 text-2xl font-bold leading-snug">{t('welcomeTitle', lang)}</h2>
          <p className="mt-3 leading-relaxed text-ink/70">{t('welcomeBody', lang)}</p>
        </div>
        <button onClick={() => setStep(1)}
          className="w-full rounded-2xl bg-water py-4 font-display text-base font-medium text-white shadow-lg shadow-water/30 active:scale-[0.98]">
          {t('start', lang)}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-6 py-8">
      {step === 1 && (
        <>
          <Header title={t('stepRegion', lang)} />
          <div className="grid grid-cols-2 gap-2.5 pb-8">
            {regions.map((r) => (
              <button key={r.id}
                onClick={() => { setRegionId(r.id); setStep(2); }}
                className={`rounded-xl border px-3 py-3.5 text-left text-sm font-medium leading-tight ${regionId === r.id ? 'border-water bg-water text-white' : 'border-line bg-card text-ink'}`}>
                {r.name[lang]}
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <Header title={t('stepCrop', lang)} />
          <div className="grid grid-cols-2 gap-2.5 pb-8">
            {crops.map((c) => (
              <button key={c.id}
                onClick={() => { setCropId(c.id); setStep(3); }}
                className={`flex flex-col items-start gap-1.5 rounded-xl border px-4 py-4 text-left ${cropId === c.id ? 'border-water bg-water text-white' : 'border-line bg-card text-ink'}`}>
                <span className="text-2xl" aria-hidden>{c.emoji}</span>
                <span className="text-sm font-medium leading-tight">{c.name[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <Header title={t('stepArea', lang)} />
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-end gap-3">
              <input
                type="number" inputMode="decimal" min={0.01} max={500} step={0.1} value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label={t('stepArea', lang)}
                className="w-full border-b-2 border-water bg-transparent pb-1 font-display text-4xl font-bold text-water-deep"
              />
              <span className="pb-2 text-lg text-ink/60">{t('hectare', lang)}</span>
            </div>
            <p className="mt-3 text-sm text-ink/50">{t('areaHint', lang)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[0.1, 0.5, 1, 2, 5, 10].map((v) => (
                <button key={v} onClick={() => setArea(String(v))}
                  className={`rounded-full border px-4 py-1.5 text-sm ${areaNum === v ? 'border-water bg-water text-white' : 'border-line bg-wash text-ink/70'}`}>
                  {v} {t('hectare', lang)}
                </button>
              ))}
            </div>
          </div>
          <button disabled={!areaOk} onClick={() => setStep(4)}
            className="mt-6 w-full rounded-2xl bg-water py-4 font-display text-base font-medium text-white shadow-lg shadow-water/30 disabled:opacity-40">
            {t('next', lang)}
          </button>
        </>
      )}
      {step === 4 && (
        <>
          <Header title={t('stepSoil', lang)} />
          <div className="flex flex-col gap-3 pb-4">
            {soils.map((s) => (
              <button key={s.id} onClick={() => { setSoil(s.id); setStep(5); }}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left ${soil === s.id ? 'border-water bg-water/5 ring-2 ring-water' : 'border-line bg-card'}`}>
                <span className="text-3xl" aria-hidden>{s.icon}</span>
                <span>
                  <span className="block font-medium">{t(s.labelKey, lang)}</span>
                  <span className="block text-sm text-ink/60">{t(s.descKey, lang)}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 5 && (
        <>
          <Header title={t('stepMethod', lang)} />
          <div className="flex flex-col gap-3 pb-4">
            {methods.map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left ${method === m.id ? 'border-water bg-water/5 ring-2 ring-water' : 'border-line bg-card'}`}>
                <span className="text-3xl" aria-hidden>{m.icon}</span>
                <span>
                  <span className="block font-medium">{t(m.labelKey, lang)}</span>
                  <span className="block text-sm text-ink/60">{t(m.descKey, lang)}</span>
                </span>
              </button>
            ))}
          </div>
          <button disabled={!method || !soil}
            onClick={() => addField({ regionId, cropId, areaHa: areaNum, method: method as Method, soil: soil as Soil })}
            className="w-full rounded-2xl bg-water py-4 font-display text-base font-medium text-white shadow-lg shadow-water/30 disabled:opacity-40">
            {t('finish', lang)}
          </button>
        </>
      )}
    </div>
  );
}
