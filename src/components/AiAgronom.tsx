import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';
import { dayStatus, getCrop, getRegion, type FieldConfig } from '../engine/irrigation';
import { askAgronom, type ChatMsg } from '../lib/agronom';
import { Icon } from './Icon';

export function AiAgronom({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);
  const st = dayStatus(field);
  const stageLabel = st.inSeason ? t('stage_' + st.stage, lang) : undefined;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    setError(false);
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next);
    setLoading(true);
    try {
      const answer = await askAgronom(
        q,
        { cropId: field.cropId, regionName: region.name[lang], stage: stageLabel, lang },
        messages,
      );
      setMessages([...next, { role: 'assistant', content: answer }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const starters = [t('agronomQ1', lang), t('agronomQ2', lang), t('agronomQ3', lang)];

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col px-5 pb-28 pt-6">
      <div className="mb-2 flex items-center gap-2">
        <Icon name="sparkles" size={22} className="text-water" />
        <h2 className="font-display text-lg font-medium text-ink">{t('agronomTitle', lang)}</h2>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setError(false); }}
            className="ml-auto text-xs font-medium text-ink/40">{t('agronomClear', lang)}</button>
        )}
      </div>
      <p className="mb-4 flex items-center gap-1.5 text-sm text-ink/60">
        <span aria-hidden>{crop.emoji}</span> {crop.name[lang]} · {region.name[lang]}
      </p>

      {/* conversation */}
      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-line bg-wash p-4 text-sm leading-relaxed text-ink/60">
            {t('agronomIntro', lang)}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-water text-white' : 'border border-water/20 bg-card text-ink'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-water/20 bg-card px-4 py-3 text-sm text-ink/50">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-water border-t-transparent" />
              {t('aiThinking', lang)}
            </div>
          </div>
        )}
        {error && <p className="rounded-2xl bg-clay-soft p-3 text-sm text-clay">{t('aiError', lang)}</p>}
        <div ref={endRef} />
      </div>

      {/* starter chips */}
      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {starters.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="rounded-full border border-water/40 bg-card px-3 py-1.5 text-xs font-medium text-water-deep">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="sticky bottom-20 mt-4 flex items-end gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm">
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1} placeholder={t('agronomPlaceholder', lang)}
          className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none" />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          aria-label={t('agronomSend', lang)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-water text-white disabled:opacity-40">
          <Icon name="send" size={18} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-ink/40">{t('aiDisclaimer', lang)}</p>
    </div>
  );
}
