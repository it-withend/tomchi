import { useState } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';
import { diseaseTrees, type TreeNode } from '../data/diseases';
import { getCrop, type FieldConfig } from '../engine/irrigation';
import { aiEnabled, diagnoseText, diagnosePhoto } from '../lib/ai';
import { Icon } from './Icon';

export function Doctor({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const crop = getCrop(field.cropId);
  const [mode, setMode] = useState<'tree' | 'ai'>('tree');

  return (
    <div className="px-5 pb-28 pt-6">
      <h2 className="font-display text-lg font-medium text-ink">{t('doctorTitle', lang)}</h2>
      <p className="mb-4 text-sm leading-relaxed text-ink/60">
        {crop.emoji} {crop.name[lang]} — {t('doctorIntro', lang)}
      </p>

      {/* mode switch */}
      <div className="mb-5 flex gap-1 rounded-full bg-wash p-1">
        {(['tree', 'ai'] as const).map((mkey) => (
          <button key={mkey} onClick={() => setMode(mkey)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium ${mode === mkey ? 'bg-card text-water-deep shadow-sm' : 'text-ink/50'}`}>
            {mkey === 'tree' ? t('treeTab', lang) : <><Icon name="sparkles" size={15} /> {t('aiDoctor', lang)}</>}
          </button>
        ))}
      </div>

      {mode === 'tree' ? <SymptomTree field={field} /> : <AiPanel field={field} />}
    </div>
  );
}

function SymptomTree({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const root = diseaseTrees[field.cropId] ?? diseaseTrees.cotton;
  const [path, setPath] = useState<TreeNode[]>([root]);
  const node = path[path.length - 1];

  if (node.result) {
    return (
      <div>
        <div className="rounded-3xl border border-clay/30 bg-clay-soft p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-clay">{t('diagnosis', lang)}</p>
          <p className="mt-1 font-display text-xl font-medium text-ink">{node.result.name[lang]}</p>
        </div>
        <div className="mt-3 rounded-3xl border border-line bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-water-deep">{t('treatment', lang)}</p>
          <ol className="mt-2 flex flex-col gap-2.5">
            {node.result.treatment[lang].split(/(?<=[.!])\s+/).filter(Boolean).map((step, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-water/10 text-xs font-bold text-water-deep">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-3 rounded-3xl border border-leaf/30 bg-leaf-soft p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-leaf">{t('prevention', lang)}</p>
          <p className="mt-1.5 leading-relaxed">{node.result.prevention[lang]}</p>
        </div>
        <p className="mt-4 text-center text-xs text-ink/40">{t('doctorDisclaimer', lang)}</p>
        <button onClick={() => setPath([root])}
          className="mt-4 w-full rounded-2xl border border-water py-3.5 font-medium text-water-deep">
          {t('restart', lang)}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-3xl border border-line bg-card p-5 shadow-sm">
        <p className="font-medium leading-snug">{node.question?.[lang]}</p>
        <div className="mt-4 flex flex-col gap-2.5">
          {node.options?.map((o, i) => (
            <button key={i} onClick={() => setPath([...path, o.next])}
              className="rounded-xl border border-line bg-wash px-4 py-3.5 text-left text-sm leading-snug active:border-water">
              {o.label[lang]}
            </button>
          ))}
        </div>
      </div>
      {path.length > 1 && (
        <button onClick={() => setPath(path.slice(0, -1))}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-water-deep"><Icon name="back" size={16} /> {t('back', lang)}</button>
      )}
    </div>
  );
}

function AiPanel({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const [symptoms, setSymptoms] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!aiEnabled) {
    return (
      <div className="rounded-2xl border border-line bg-wash p-5 text-center text-sm leading-relaxed text-ink/60">
        {t('aiNotConfigured', lang)}
      </div>
    );
  }

  const ask = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setError(null); setAnswer(null);
    try {
      setAnswer(await diagnoseText(field.cropId, symptoms.trim(), lang));
    } catch {
      setError(t('aiError', lang));
    } finally {
      setLoading(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(null); setAnswer(null);
    try {
      const base64 = await fileToBase64(file);
      setAnswer(await diagnosePhoto(field.cropId, base64, lang));
    } catch {
      setError(t('aiError', lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed text-ink/60">{t('aiIntro', lang)}</p>
      <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
        rows={3} placeholder={t('aiPlaceholder', lang)}
        className="w-full rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed outline-none focus:border-water" />

      <div className="mt-3 flex gap-2">
        <button onClick={ask} disabled={loading || !symptoms.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-water py-3.5 font-medium text-white disabled:opacity-40">
          {loading ? t('aiThinking', lang) : <><Icon name="sparkles" size={16} /> {t('aiAsk', lang)}</>}
        </button>
        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-water/40 bg-card px-4 py-3.5 text-sm font-medium text-water-deep">
          <Icon name="diagnosis" size={16} /> {t('aiPhoto', lang)}
          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
        </label>
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-wash p-4 text-sm text-ink/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-water border-t-transparent" />
          {t('aiThinking', lang)}
        </div>
      )}
      {error && <p className="mt-4 rounded-2xl bg-clay-soft p-4 text-sm text-clay">{error}</p>}
      {answer && (
        <div className="mt-4">
          <div className="rounded-3xl border border-water/20 bg-card p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-water-deep"><Icon name="sparkles" size={14} /> {t('aiDoctor', lang)}</p>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{answer}</div>
          </div>
          <p className="mt-3 text-center text-xs text-ink/40">{t('aiDisclaimer', lang)}</p>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // strip data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
