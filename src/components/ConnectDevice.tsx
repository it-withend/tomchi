import { useState } from 'react';
import { useApp } from '../state';
import { t, formatNum } from '../i18n';
import { suggestedFlowLpm, connectDevice, type Device } from '../lib/devices';
import type { FieldConfig } from '../engine/irrigation';
import { Icon, type IconName } from './Icon';

/** What can eventually be attached to a field. Only the valve exists so far. */
const HARDWARE: { icon: IconName; titleKey: string; descKey: string }[] = [
  { icon: 'tap', titleKey: 'devValve', descKey: 'devValveDesc' },
  { icon: 'droplet-grid', titleKey: 'devMoisture', descKey: 'devMoistureDesc' },
  { icon: 'thermometer', titleKey: 'devWeather', descKey: 'devWeatherDesc' },
  { icon: 'camera', titleKey: 'devCamera', descKey: 'devCameraDesc' },
];

export function ConnectDevice({ field, onConnected }: { field: FieldConfig; onConnected: (d: Device) => void }) {
  const { lang } = useApp();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const suggested = suggestedFlowLpm(field.method, field.areaHa);

  const startDemo = async () => {
    setBusy(true);
    setFailed(false);
    const device = await connectDevice(field.id, suggested);
    setBusy(false);
    // A silent no-op would read as a dead button, so say so instead.
    if (device) onConnected(device);
    else setFailed(true);
  };

  return (
    <div className="px-5 pb-28 pt-6 lg:max-w-2xl lg:pb-10 lg:pl-0 lg:pr-1 lg:pt-8">
      <h2 className="font-display text-lg font-medium text-ink">{t('connectDeviceTitle', lang)}</h2>
      <p className="mb-5 mt-1 text-sm leading-relaxed text-ink/60">{t('connectDeviceIntro', lang)}</p>

      <ul className="flex flex-col gap-2.5">
        {HARDWARE.map((h) => (
          <li key={h.titleKey} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-water-deep">
              <Icon name={h.icon} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">{t(h.titleKey, lang)}</span>
                <span className="rounded-full bg-sky px-2 py-0.5 text-[10px] font-medium text-indigo">
                  {t('comingSoon', lang)}
                </span>
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink/55">{t(h.descKey, lang)}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-water/30 bg-water/5 p-5">
        <p className="font-display text-base font-bold text-water-deep">{t('tryDemoTitle', lang)}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink/70">{t('tryDemoBody', lang)}</p>
        <p className="mt-2 text-xs text-ink/50">
          {t('flowLabel', lang)}: {formatNum(suggested, lang)} {t('lpm', lang)} — {t('flowEditable', lang)}
        </p>
        <button
          onClick={startDemo}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-water py-3 text-sm font-medium text-white active:scale-[0.98] disabled:opacity-60">
          {busy ? t('connecting', lang) : t('tryDemoAction', lang)}
        </button>
        {failed && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-sky p-3 text-xs leading-snug text-ink/75">
            <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
            {t('connectFailed', lang)}
          </p>
        )}
      </div>
    </div>
  );
}
