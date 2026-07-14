import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../state';
import { t } from '../i18n';
import { Icon } from './Icon';

// Satellite location picker. The farmer pans a Sentinel-quality basemap under a
// fixed centre pin (like a ride-hailing app), so we never fight Leaflet's
// bundler-hostile marker assets. On save we hand back the map centre.
export function FieldMap({
  initial, onSave, onClose,
}: {
  initial: { lat: number; lng: number; zoom?: number };
  onSave: (lat: number, lng: number) => void;
  onClose: () => void;
}) {
  const { lang } = useApp();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [gpsError, setGpsError] = useState(false);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: true })
      .setView([initial.lat, initial.lng], initial.zoom ?? 15);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' },
    ).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [initial.lat, initial.lng, initial.zoom]);

  const useGps = () => {
    setGpsError(false);
    if (!navigator.geolocation) { setGpsError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 16),
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const save = () => {
    const c = mapRef.current?.getCenter();
    if (c) onSave(c.lat, c.lng);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full w-full max-w-md flex-col bg-card">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Icon name="pin" size={20} className="text-water-deep" />
            <h2 className="font-display font-bold text-water-deep">{t('pickTitle', lang)}</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-line px-3 py-1 text-sm text-ink/60">
            {t('pickCancel', lang)}
          </button>
        </header>

        <p className="px-5 py-2.5 text-xs leading-snug text-ink/60">{t('pickHint', lang)}</p>

        {/* map + fixed centre pin */}
        <div className="relative flex-1">
          <div ref={elRef} className="absolute inset-0" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[400] -translate-x-1/2 -translate-y-full">
            <Icon name="pin" size={40} className="text-water drop-shadow-md" strokeWidth={2.2} />
          </div>
          <button onClick={useGps}
            className="absolute bottom-4 right-4 z-[400] flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-water-deep shadow-lg active:scale-95">
            <Icon name="tap" size={16} /> {t('pickGps', lang)}
          </button>
        </div>

        {gpsError && (
          <p className="bg-clay-soft px-5 py-2 text-center text-xs text-clay">{t('pickGpsFail', lang)}</p>
        )}

        <div className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button onClick={save}
            className="w-full rounded-xl bg-water py-3.5 text-sm font-semibold text-white active:scale-[0.99]">
            {t('pickSave', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FieldMap;
