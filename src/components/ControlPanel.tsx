import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../state';
import { t, fmt, formatNum, formatDate } from '../i18n';
import { type FieldConfig } from '../engine/irrigation';
import { soilWater } from '../engine/soilWater';
import { useForecast } from '../useForecast';
import { dayFrom, DANGEROUS_HEAT_C } from '../engine/weather';
import {
  getDevice, getActiveSession, startIrrigation, stopIrrigation, listSessions,
  updateFlow, disconnectDevice, progressOf, plannedMinutes, exceedsSessionLimit, litersForDeficit,
  MAX_SESSION_MINUTES, type Device, type Session, type SessionProgress,
} from '../lib/devices';
import { MoistureGauge } from './MoistureGauge';
import { ConnectDevice } from './ConnectDevice';
import { Icon } from './Icon';

export function ControlPanel({ field }: { field: FieldConfig }) {
  const { lang, syncEnabled } = useApp();
  const forecast = useForecast(field.regionId);
  const water = soilWater(field, forecast);
  const today = dayFrom(forecast);
  const dangerousHeat = !!today && today.tMax >= DANGEROUS_HEAT_C;

  const [device, setDevice] = useState<Device | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<SessionProgress | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);
  const [editingFlow, setEditingFlow] = useState(false);
  const [flowDraft, setFlowDraft] = useState('');

  const refresh = useCallback(async () => {
    if (!syncEnabled) { setLoaded(true); return; }
    const d = await getDevice(field.id);
    setDevice(d);
    if (d) {
      setActive(await getActiveSession(field.id, d.flowLpm));
      setHistory(await listSessions(field.id));
    }
    setLoaded(true);
  }, [field.id, syncEnabled]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Progress comes from the session's own timestamps, so the bar can advance
  // locally every second without asking the server anything.
  useEffect(() => {
    if (!active || !device) return;
    const id = setInterval(() => {
      const next = progressOf(active.session, device.flowLpm);
      setActive(next);
      // Once the planned end has passed the scheduler closes the row; go and
      // pick up the real outcome instead of showing a stuck full bar.
      if (next.fraction >= 1) void refresh();
    }, 1000);
    return () => clearInterval(id);
  }, [active, device, refresh]);

  if (!syncEnabled) {
    return (
      <div className="px-5 pb-28 pt-6 lg:max-w-2xl lg:pb-10 lg:pl-0 lg:pr-1 lg:pt-8">
        <h2 className="font-display text-lg font-medium text-ink">{t('tabControl', lang)}</h2>
        {water.inSeason && (
          <section className="mt-4 rounded-3xl border border-line bg-card p-5 shadow-sm">
            <MoistureGauge water={water} />
          </section>
        )}
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sky p-4 text-sm leading-relaxed text-ink/70">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {t('controlNeedsCloud', lang)}
        </p>
      </div>
    );
  }

  if (!loaded) return <div className="px-5 pt-10 text-center text-sm text-ink/45">{t('loading', lang)}</div>;
  if (!device) return <ConnectDevice field={field} onConnected={(d) => { setDevice(d); void refresh(); }} />;

  const liters = litersForDeficit(water.netMm, field.method, field.areaHa);
  const minutes = plannedMinutes(liters, device.flowLpm);
  const clipped = exceedsSessionLimit(liters, device.flowLpm);
  const nothingToDo = !water.inSeason || liters < 1;

  const start = async () => {
    const volume = formatNum(liters / 1000, lang);
    if (!window.confirm(fmt(t('startConfirm', lang), volume, String(minutes)))) return;
    setBusy(true);
    const session = await startIrrigation(field.id, liters, device.flowLpm);
    setBusy(false);
    if (session) setActive(progressOf(session, device.flowLpm));
    else window.alert(t('startFailed', lang));
  };

  const stop = async () => {
    if (!active) return;
    if (!window.confirm(t('stopConfirm', lang))) return;
    setBusy(true);
    await stopIrrigation(active.session, field.id, device.flowLpm);
    setActive(null);
    setBusy(false);
    void refresh();
  };

  // Deleting the device cascades to its sessions, so this is offered only when
  // nothing is running — otherwise a live irrigation would vanish from the app
  // while the valve, in a real installation, stayed open.
  const forget = async () => {
    if (!window.confirm(t('unlinkDeviceConfirm', lang))) return;
    setBusy(true);
    await disconnectDevice(field.id);
    setBusy(false);
    setDevice(null);
    setActive(null);
    setHistory([]);
  };

  const saveFlow = async () => {
    const value = Math.round(Number(flowDraft.replace(',', '.')));
    if (!Number.isFinite(value) || value <= 0) { setEditingFlow(false); return; }
    await updateFlow(field.id, value);
    setEditingFlow(false);
    void refresh();
  };

  return (
    <div className="px-5 pb-28 pt-6 lg:max-w-2xl lg:pb-10 lg:pl-0 lg:pr-1 lg:pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-ink">{t('tabControl', lang)}</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-sky px-2.5 py-1 text-[10px] font-medium text-indigo">
            <Icon name="tap" size={12} /> {t('virtualDevice', lang)}
          </span>
          {!active && (
            <button onClick={forget} disabled={busy}
              className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50">
              <Icon name="unlink" size={12} /> {t('unlinkDevice', lang)}
            </button>
          )}
        </div>
      </div>

      {dangerousHeat && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-water-deep p-4 text-white">
          <Icon name="alert" size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-snug">{t('heatStayInside', lang)}</p>
        </div>
      )}

      <section className="mt-4 rounded-3xl border border-line bg-card p-5 shadow-sm">
        <MoistureGauge water={water} />
      </section>

      {active ? (
        <section className="mt-4 rounded-3xl bg-water-deep p-5 text-white">
          <p className="text-xs uppercase tracking-wide text-white/70">{t('irrigationRunning', lang)}</p>
          <p className="mt-1 font-display text-3xl font-bold tnum">
            {formatNum(active.deliveredLiters / 1000, lang)} {t('m3', lang)}
          </p>
          <p className="text-sm text-white/75">
            {t('ofPlanned', lang)} {formatNum(active.session.plannedLiters / 1000, lang)} {t('m3', lang)}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-[width] duration-1000"
              style={{ width: `${Math.round(active.fraction * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/70">
            {fmt(t('minutesLeft', lang), String(active.minutesLeft))}
          </p>

          <button onClick={stop} disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-water-deep active:scale-[0.98] disabled:opacity-60">
            <Icon name="stop" size={16} /> {t('stopIrrigation', lang)}
          </button>
        </section>
      ) : (
        <section className="mt-4 rounded-3xl border border-line bg-card p-5 shadow-sm">
          {nothingToDo ? (
            <p className="text-sm leading-relaxed text-ink/60">{t('nothingToWater', lang)}</p>
          ) : (
            <>
              <p className="text-xs text-ink/50">{t('recommendedNow', lang)}</p>
              <p className="mt-1 font-display text-3xl font-bold tnum text-water-deep">
                {formatNum(liters / 1000, lang)} {t('m3', lang)}
              </p>
              <p className="text-sm text-ink/60">≈ {fmt(t('minutesOfWatering', lang), String(minutes))}</p>

              {clipped && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-sky p-3 text-xs leading-snug text-ink/70">
                  <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
                  {fmt(t('sessionClipped', lang), String(Math.round(MAX_SESSION_MINUTES / 60)))}
                </p>
              )}

              <button onClick={start} disabled={busy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-water py-3.5 text-sm font-medium text-white active:scale-[0.98] disabled:opacity-60">
                <Icon name="drop" size={17} /> {t('startIrrigation', lang)}
              </button>
            </>
          )}

          {/* flow rate — the number that turns a volume into a duration */}
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
            <span className="text-ink/50">{t('flowLabel', lang)}</span>
            {editingFlow ? (
              <span className="flex items-center gap-2">
                <input
                  autoFocus type="number" inputMode="numeric" value={flowDraft}
                  onChange={(e) => setFlowDraft(e.target.value)}
                  className="w-20 rounded-lg border border-line px-2 py-1 text-right tnum"
                  aria-label={t('flowLabel', lang)}
                />
                <button onClick={saveFlow} className="font-medium text-water-deep">{t('save', lang)}</button>
              </span>
            ) : (
              <button
                onClick={() => { setFlowDraft(String(device.flowLpm)); setEditingFlow(true); }}
                className="font-medium tnum text-water-deep underline decoration-line underline-offset-4">
                {formatNum(device.flowLpm, lang)} {t('lpm', lang)}
              </button>
            )}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-4 rounded-2xl border border-line bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{t('sessionHistory', lang)}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink/75">
                  <Icon
                    name={s.status === 'done' ? 'check' : s.status === 'running' ? 'drop' : 'stop'}
                    size={14}
                    className="shrink-0 text-water"
                  />
                  {formatDate(new Date(s.startedAt), lang)}
                </span>
                <span className="tnum text-ink/55">
                  {formatNum((s.deliveredLiters ?? s.plannedLiters) / 1000, lang)} {t('m3', lang)}
                  {s.status === 'stopped' && ` · ${t('stoppedShort', lang)}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
