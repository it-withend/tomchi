import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../state';
import { t, fmt, formatNum } from '../i18n';
import { polygonAreaHa, polygonCentre, roundHa, isPlausibleFieldArea, MAX_FIELD_HA, type LatLng } from '../engine/geo';
import { Icon } from './Icon';

export interface FieldShape {
  areaHa: number;
  boundary: LatLng[];
}

// Satellite picker with two ways to describe a field.
//
// "Point" pans a fixed centre pin under the map, like a ride-hailing app, which
// avoids fighting Leaflet's bundler-hostile marker assets. "Outline" lets the
// farmer tap the corners of the plot; we measure what they drew, so the hectare
// figure is traced off the imagery instead of recalled from memory.
export function FieldMap({
  initial, initialBoundary, onSave, onClose,
}: {
  initial: { lat: number; lng: number; zoom?: number };
  initialBoundary?: LatLng[];
  onSave: (lat: number, lng: number, shape?: FieldShape) => void;
  onClose: () => void;
}) {
  const { lang } = useApp();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const shapeRef = useRef<L.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [mode, setMode] = useState<'point' | 'outline'>(initialBoundary?.length ? 'outline' : 'point');
  const [points, setPoints] = useState<LatLng[]>(initialBoundary ?? []);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: true })
      .setView([initial.lat, initial.lng], initial.zoom ?? 15);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' },
    ).addTo(map);
    shapeRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setReady(true);
    return () => { map.remove(); mapRef.current = null; shapeRef.current = null; };
  }, [initial.lat, initial.lng, initial.zoom]);

  // Tapping the map drops a corner — only while tracing an outline.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      if (mode !== 'outline') return;
      setPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [mode, ready]);

  // Redraw the outline whenever the corners change.
  useEffect(() => {
    const group = shapeRef.current;
    if (!group) return;
    group.clearLayers();
    if (mode !== 'outline' || !points.length) return;

    const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
    if (points.length >= 3) {
      L.polygon(latlngs, { color: '#0f7ba0', weight: 2.5, fillColor: '#0f7ba0', fillOpacity: 0.22 }).addTo(group);
    } else if (points.length === 2) {
      L.polyline(latlngs, { color: '#0f7ba0', weight: 2.5, dashArray: '5 5' }).addTo(group);
    }
    points.forEach((p) => {
      L.circleMarker([p.lat, p.lng], {
        radius: 6, color: '#ffffff', weight: 2, fillColor: '#0a5570', fillOpacity: 1,
      }).addTo(group);
    });
  }, [points, mode]);

  const useGps = () => {
    setGpsError(false);
    if (!navigator.geolocation) { setGpsError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 16),
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const areaHa = points.length >= 3 ? roundHa(polygonAreaHa(points)) : 0;
  const areaPlausible = isPlausibleFieldArea(areaHa);
  const outlineReady = points.length >= 3 && areaPlausible;

  const save = () => {
    if (mode === 'outline' && outlineReady) {
      const centre = polygonCentre(points)!;
      onSave(centre.lat, centre.lng, { areaHa, boundary: points });
      return;
    }
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

        {/* how the farmer wants to describe the field */}
        <div className="flex gap-2 px-5 pt-3" role="tablist">
          {(['point', 'outline'] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-medium ${
                mode === m ? 'bg-water text-white' : 'border border-line bg-card text-ink/65'}`}>
              {t(m === 'point' ? 'modePoint' : 'modeOutline', lang)}
            </button>
          ))}
        </div>

        <p className="px-5 py-2.5 text-xs leading-snug text-ink/60">
          {t(mode === 'point' ? 'pickHint' : 'outlineHint', lang)}
        </p>

        <div className="relative flex-1">
          <div ref={elRef} className="absolute inset-0" />

          {mode === 'point' && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[400] -translate-x-1/2 -translate-y-full">
              <Icon name="pin" size={40} className="text-water drop-shadow-md" strokeWidth={2.2} />
            </div>
          )}

          {mode === 'outline' && points.length > 0 && (
            <div className="absolute left-4 top-4 z-[400] flex items-center gap-2">
              <span className="rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium tnum text-water-deep shadow-md backdrop-blur">
                {points.length >= 3
                  ? `${formatNum(areaHa, lang)} ${t('hectare', lang)}`
                  : `${points.length}/3 ${t('cornersShort', lang)}`}
              </span>
              <button onClick={() => setPoints((p) => p.slice(0, -1))}
                className="rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-ink/70 shadow-md backdrop-blur">
                {t('undoPoint', lang)}
              </button>
              <button onClick={() => setPoints([])}
                className="rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-ink/70 shadow-md backdrop-blur">
                {t('clearPoints', lang)}
              </button>
            </div>
          )}

          <button onClick={useGps}
            className="absolute bottom-4 right-4 z-[400] flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-water-deep shadow-lg active:scale-95">
            <Icon name="pin" size={16} /> {t('pickGps', lang)}
          </button>
        </div>

        {points.length >= 3 && !areaPlausible && (
          <p className="flex items-center justify-center gap-1.5 bg-sky px-5 py-2 text-center text-xs text-ink/75">
            <Icon name="alert" size={13} className="shrink-0" />
            {fmt(t('outlineTooBig', lang), String(MAX_FIELD_HA))}
          </p>
        )}

        {gpsError && (
          <p className="flex items-center justify-center gap-1.5 bg-sky px-5 py-2 text-center text-xs text-ink/70">
            <Icon name="alert" size={13} className="shrink-0" />{t('pickGpsFail', lang)}
          </p>
        )}

        <div className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button onClick={save} disabled={mode === 'outline' && !outlineReady}
            className="w-full rounded-xl bg-water py-3.5 text-sm font-semibold text-white active:scale-[0.99] disabled:opacity-40">
            {mode === 'outline' && outlineReady
              ? `${t('saveAreaAs', lang)} ${formatNum(areaHa, lang)} ${t('hectare', lang)}`
              : t('pickSave', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FieldMap;
