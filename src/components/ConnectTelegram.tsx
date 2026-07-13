import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';
import { createPairCode } from '../lib/sync';

const BOT = 'tomchiaibot';

export function ConnectTelegram({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const [code, setCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    createPairCode().then((c) => (c ? setCode(c) : setFailed(true)));
  }, []);

  const command = code ? `/link ${code}` : '';

  const copy = () => {
    navigator.clipboard?.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/60 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label={t('pairTitle', lang)} onClick={onClose}>
      <div className="mx-auto w-full max-w-md rounded-t-3xl bg-card px-6 pb-8 pt-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-medium text-ink">{t('pairTitle', lang)}</h3>
          <button onClick={onClose} className="text-sm font-medium text-ink/50">{t('close', lang)}</button>
        </div>

        <ol className="mt-5 flex flex-col gap-3 text-sm leading-relaxed">
          <li>{t('pairStep1', lang)}</li>
          <li>
            {t('pairStep2', lang)}
            <button onClick={copy} disabled={!code}
              className="mt-2 flex w-full items-center justify-between rounded-xl border border-water/40 bg-wash px-4 py-3 font-mono text-base font-bold text-water-deep disabled:opacity-50">
              {failed ? t('pairError', lang) : code ? command : t('pairGenerating', lang)}
              {code && <span className="text-xs font-body font-medium text-water">{copied ? t('copied', lang) : '⧉'}</span>}
            </button>
            {code && <p className="mt-1 text-xs text-ink/40">{t('pairExpires', lang)}</p>}
          </li>
          <li>{t('pairStep3', lang)}</li>
        </ol>

        <a href={`https://t.me/${BOT}`} target="_blank" rel="noopener noreferrer"
          className="mt-6 block w-full rounded-2xl bg-water py-3.5 text-center font-display text-base font-medium text-white">
          {t('openBot', lang)}
        </a>
      </div>
    </div>
  );
}
