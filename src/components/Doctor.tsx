import { useState } from 'react';
import { useApp } from '../state';
import { t } from '../i18n';
import { diseaseTrees, type TreeNode } from '../data/diseases';
import { getCrop, type FieldConfig } from '../engine/irrigation';

export function Doctor({ field }: { field: FieldConfig }) {
  const { lang } = useApp();
  const crop = getCrop(field.cropId);
  const root = diseaseTrees[field.cropId] ?? diseaseTrees.cotton;
  const [path, setPath] = useState<TreeNode[]>([root]);
  const node = path[path.length - 1];

  return (
    <div className="px-5 pb-28 pt-6">
      <h2 className="font-display text-lg font-medium text-ink">{t('doctorTitle', lang)}</h2>
      <p className="mb-5 text-sm leading-relaxed text-ink/60">
        {crop.emoji} {crop.name[lang]} — {t('doctorIntro', lang)}
      </p>

      {node.result ? (
        <div>
          <div className="rounded-3xl border border-clay/30 bg-clay-soft p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-clay">{t('diagnosis', lang)}</p>
            <p className="mt-1 font-display text-xl font-medium text-ink">{node.result.name[lang]}</p>
          </div>
          <div className="mt-3 rounded-3xl border border-line bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-water-deep">{t('treatment', lang)}</p>
            <p className="mt-1.5 leading-relaxed">{node.result.treatment[lang]}</p>
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
      ) : (
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
              className="mt-4 text-sm font-medium text-water-deep">← {t('back', lang)}</button>
          )}
        </div>
      )}
    </div>
  );
}
