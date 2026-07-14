import { useState, useRef, useEffect } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';
import { diseaseTrees, type TreeNode } from '../data/diseases';
import { getCrop, type FieldConfig } from '../engine/irrigation';
import { chatAsk, type ChatMsg } from '../lib/ai';
import { useVoiceInput, speak, stopSpeak, ttsSupported } from '../lib/voice';
import { Icon } from './Icon';

const CHAT_KEY = 'tomchi.chat';

function loadChat(): ChatMsg[] {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch { return []; }
}
function saveChat(msgs: ChatMsg[]) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
  } catch {
    // localStorage quota (photos are heavy) — keep text, drop older images.
    try {
      const trimmed = msgs.map((m, i) => (i >= msgs.length - 2 ? m : { ...m, image: undefined }));
      localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
    } catch { /* give up silently */ }
  }
}

/** Downscale a photo to a data URL small enough to store and send. */
function downscale(file: File, max = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function Doctor({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const crop = getCrop(field.cropId);
  const [messages, setMessages] = useState<ChatMsg[]>(loadChat);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<string | null>(null); // attached photo data URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTree, setShowTree] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceInput(lang, (text) => setInput((v) => (v ? v.trim() + ' ' : '') + text));

  useEffect(() => { saveChat(messages); }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => () => stopSpeak(), []); // stop any speech when leaving

  const toggleSpeak = (i: number, text: string) => {
    if (speakingIdx === i) { stopSpeak(); setSpeakingIdx(null); return; }
    speak(text, lang); setSpeakingIdx(i);
  };

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text && !pending) return;
    const userMsg: ChatMsg = {
      role: 'user',
      text: text || (lang === 'ru' ? 'Что с растением на фото?' : 'Rasmda nima bo‘lgan?'),
      image: pending ?? undefined,
    };
    const next = [...messages, userMsg];
    const img = pending ? pending.split(',')[1] : undefined;
    setMessages(next); setInput(''); setPending(null); setError(null); setLoading(true);
    try {
      const answer = await chatAsk(field.cropId, next, lang, img);
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    } catch {
      setError(t('aiError', lang));
    } finally {
      setLoading(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { try { setPending(await downscale(file)); } catch { /* ignore */ } }
    e.target.value = '';
  };

  const clear = () => {
    if (messages.length && !window.confirm(t('chatClearAsk', lang))) return;
    setMessages([]); setError(null); setPending(null);
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col px-5 pb-40 pt-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-water/10 text-water-deep"><Icon name="sparkles" size={18} /></span>
          <div>
            <h2 className="font-display text-base font-medium leading-tight text-ink">{t('chatTitle', lang)}</h2>
            <p className="text-xs text-ink/50">{crop.emoji} {crop.name[lang]}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} aria-label={t('chatClear', lang)}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/60">
            <Icon name="trash" size={14} /> {t('chatClear', lang)}
          </button>
        )}
      </div>

      {/* messages */}
      <div className="mt-4 flex-1 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="rounded-3xl border border-line bg-card p-5 text-center">
            <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-wash text-water-deep"><Icon name="sparkles" size={26} /></span>
            <p className="text-sm leading-relaxed text-ink/60">{t('chatEmpty', lang)}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(['chatSug1', 'chatSug2', 'chatSug3'] as const).map((k) => (
                <button key={k} onClick={() => send(t(k, lang))}
                  className="rounded-full border border-water/30 bg-water/5 px-3 py-1.5 text-xs font-medium text-water-deep">
                  {t(k, lang)}
                </button>
              ))}
            </div>
            {voice.supported && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-water-deep/70">
                <Icon name="mic" size={14} /> {t('voiceHintEmpty', lang)}
              </p>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user' ? 'rounded-br-lg bg-water text-white' : 'rounded-bl-lg border border-line bg-card text-ink'}`}>
              {m.image && <img src={m.image} alt="" className="mb-2 max-h-52 w-full rounded-xl object-cover" />}
              {m.role === 'assistant'
                ? <span className="whitespace-pre-wrap">{m.text}</span>
                : m.text}
              {m.role === 'assistant' && m.text && ttsSupported() && (
                <button onClick={() => toggleSpeak(i, m.text)} aria-label={t('voiceListen', lang)}
                  className="mt-1.5 flex items-center gap-1 text-xs font-medium text-water-deep/70">
                  <Icon name={speakingIdx === i ? 'stop' : 'speaker'} size={14} />
                  {t('voiceListen', lang)}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg border border-line bg-card px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-water/60" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        {error && <p className="rounded-2xl bg-clay-soft p-3 text-center text-sm text-clay">{error}</p>}
        {messages.length > 0 && !loading && (
          <p className="pt-1 text-center text-[11px] text-ink/40">{t('aiDisclaimer', lang)}</p>
        )}
        <div ref={endRef} />
      </div>

      {/* guided-check shortcut */}
      <button onClick={() => setShowTree(true)}
        className="mt-3 inline-flex items-center gap-1.5 self-center rounded-full px-3 py-1 text-xs font-medium text-water-deep/70">
        <Icon name="diagnosis" size={14} /> {t('chatGuided', lang)}
      </button>

      {/* composer (fixed above tab bar) */}
      <div className="fixed inset-x-0 bottom-[4.25rem] z-20 mx-auto w-full max-w-md px-4">
        {pending && (
          <div className="mb-2 flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-xs text-ink/60 shadow-sm backdrop-blur">
            <img src={pending} alt="" className="h-7 w-7 rounded-md object-cover" />
            {t('photoAttached', lang)}
            <button onClick={() => setPending(null)} className="ml-auto text-ink/40" aria-label={t('close', lang)}>✕</button>
          </div>
        )}
        {/* voice status / error */}
        {(voice.status !== 'idle' || voice.error) && (
          <div className={`mb-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs shadow-sm backdrop-blur ${
            voice.error ? 'bg-clay-soft text-clay' : 'bg-card/95 text-water-deep'}`}>
            {voice.status === 'listening' && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay" />}
            {voice.error
              ? t(voice.error === 'denied' ? 'voiceDenied' : 'voiceError', lang)
              : t(voice.status === 'listening' ? 'voiceListening' : 'voiceTranscribing', lang)}
            {voice.error && <button onClick={voice.clearError} className="ml-auto text-clay/60" aria-label={t('close', lang)}>✕</button>}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-3xl border border-line bg-card p-1.5 shadow-lg shadow-ink/5">
          <label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-water-deep hover:bg-wash" aria-label={t('aiPhoto', lang)}>
            <Icon name="diagnosis" size={20} />
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
          </label>
          {voice.supported && (
            <button onClick={voice.toggle} disabled={voice.status === 'working'}
              aria-label={t(voice.status === 'listening' ? 'voiceStop' : 'voiceStart', lang)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full disabled:opacity-50 ${
                voice.status === 'listening' ? 'animate-pulse bg-clay text-white' : 'text-water-deep hover:bg-wash'}`}>
              <Icon name={voice.status === 'listening' ? 'stop' : 'mic'} size={20} />
            </button>
          )}
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1} placeholder={t('chatPlaceholder', lang)}
            className="max-h-28 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed outline-none" />
          <button onClick={() => send()} disabled={loading || (!input.trim() && !pending)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-water text-white disabled:opacity-40" aria-label={t('aiAsk', lang)}>
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>

      {showTree && <TreeModal field={field} onClose={() => setShowTree(false)} />}
    </div>
  );
}

function TreeModal({ field, onClose }: { field: FieldConfig; onClose: () => void }) {
  const { lang } = useApp();
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-wash px-5 pb-8 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-medium text-ink">{t('treeTab', lang)}</h3>
          <button onClick={onClose} className="text-sm font-medium text-ink/50">{t('close', lang)}</button>
        </div>
        <SymptomTree field={field} />
      </div>
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
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-water/10 text-xs font-bold text-water-deep">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-3 rounded-3xl border border-leaf/30 bg-leaf-soft p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-leaf">{t('prevention', lang)}</p>
          <p className="mt-1.5 leading-relaxed">{node.result.prevention[lang]}</p>
        </div>
        <button onClick={() => setPath([root])} className="mt-4 w-full rounded-2xl border border-water py-3.5 font-medium text-water-deep">
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
