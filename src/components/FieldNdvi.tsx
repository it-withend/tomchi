import { lazy, Suspense, useEffect, useState } from 'react';
import { useApp } from '../state';
import { t, formatNum, formatDate } from '../i18n';
import { getRegion, type FieldConfig } from '../engine/irrigation';
import { fetchNdvi, type Ndvi } from '../lib/ndvi';
import { Icon } from './Icon';

const FieldMap = lazy(() => import('./FieldMap'));

const STATUS = {
  healthy: { key: 'satHealthy', cls: 'text-leaf', bg: 'bg-leaf-soft' },
  moderate: { key: 'satModerate', cls: 'text-clay', bg: 'bg-clay-soft' },
  stressed: { key: 'satStressed', cls: 'text-clay', bg: 'bg-clay-soft' },
  nodata: { key: 'satNoData', cls: 'text-ink/50', bg: 'bg-wash' },
} as const;

export function FieldNdvi({ field }: { field: FieldConfig }) {
  const { lang, updateField } = useApp();
  const [showMap, setShowMap] = useState(false);
  const [data, setData] = useState<Ndvi | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const hasLoc = field.lat != null && field.lng != null;

  const load = () => {
    if (field.lat == null || field.lng == null) return;
    setLoading(true);
    setFailed(false);
    fetchNdvi(field.id, field.lat, field.lng, field.areaHa)
      .then((d) => { if (d) setData(d); else setFailed(true); })
      .finally(() => setLoading(false));
  };

  // Fetch whenever the field or its location changes.
  useEffect(() => {
    setData(null);
    if (hasLoc) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.id, field.lat, field.lng]);

  const saveLoc = (lat: number, lng: number) => {
    updateField(field.id, { lat, lng });
    setShowMap(false);
  };

  const region = getRegion(field.regionId);
  const initial = { lat: field.lat ?? region.lat, lng: field.lng ?? region.lon, zoom: hasLoc ? 15 : 11 };

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 pt-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-water/10 text-water-deep">
          <Icon name="satellite" size={19} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-sm font-bold text-water-deep">{t('satTitle', lang)}</h2>
          <p className="text-[11px] text-ink/50">{t('satSub', lang)}</p>
        </div>
        {hasLoc && (
          <button onClick={() => setShowMap(true)} title={t('satMark', lang)}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-water-deep">
            <Icon name="pin" size={15} />
          </button>
        )}
      </div>

      {!hasLoc ? (
        <div className="px-5 py-6 text-center">
          <p className="mx-auto mb-4 max-w-xs text-sm leading-relaxed text-ink/60">{t('satSetHint', lang)}</p>
          <button onClick={() => setShowMap(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-water px-5 py-3 text-sm font-semibold text-white active:scale-[0.98]">
            <Icon name="pin" size={17} /> {t('satMark', lang)}
          </button>
        </div>
      ) : (
        <div className="px-5 pb-5 pt-4">
          {/* satellite plot */}
          <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-wash">
            {data?.img ? (
              <img src={data.img} alt={t('satTitle', lang)} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-ink/40">
                {loading ? t('satLoading', lang) : failed ? t('satError', lang) : ''}
              </div>
            )}
            {/* centre reticle marking the field */}
            {data?.img && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 shadow" />
            )}
          </div>

          {/* legend */}
          <div className="mx-auto mt-2 flex max-w-[280px] items-center gap-2 text-[10px] text-ink/50">
            <span>{t('satLegendLow', lang)}</span>
            <span className="h-2 flex-1 rounded-full"
              style={{ background: 'linear-gradient(90deg,#c7733a,#e69e47,#f5db61,#99cc52,#4da842,#1f7a33)' }} />
            <span>{t('satLegendHigh', lang)}</span>
          </div>

          {/* health readout */}
          {data && data.status !== 'nodata' ? (
            <div className="mt-4">
              <div className="flex items-end justify-between">
                <p className="text-xs text-ink/50">{t('satHealth', lang)}</p>
                {data.date && (
                  <p className="text-[11px] text-ink/40">
                    {t('satScene', lang)}: {formatDate(new Date(data.date), lang)}
                  </p>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3">
                <p className="font-display text-3xl font-bold text-water-deep">
                  {formatNum(data.health ?? 0, lang)}<span className="text-lg">%</span>
                </p>
                <p className={`flex-1 text-sm font-medium ${STATUS[data.status].cls}`}>
                  {t(STATUS[data.status].key, lang)}
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${data.health ?? 0}%` }} />
              </div>
            </div>
          ) : (
            !loading && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-center text-sm ${STATUS.nodata.bg} ${STATUS.nodata.cls}`}>
                {failed ? t('satError', lang) : t('satNoData', lang)}
                <button onClick={load} className="ml-2 font-medium text-water-deep underline">{t('satRefresh', lang)}</button>
              </div>
            )
          )}
        </div>
      )}

      {showMap && (
        <Suspense fallback={null}>
          <FieldMap initial={initial} onSave={saveLoc} onClose={() => setShowMap(false)} />
        </Suspense>
      )}
    </section>
  );
}
