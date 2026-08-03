import { t, formatNum, formatDate, type Lang } from '../i18n';
import { getCrop, getRegion, seasonTotals, dayStatus, lastEventDate, SOM_PER_M3, type FieldConfig } from './irrigation';

const methodLabel: Record<string, string> = { furrow: 'furrow', sprinkler: 'sprinkler', drip: 'drip' };

// The report is a standalone HTML document, so it can't import the React Icon
// component. This is the one glyph it needs, inlined in the same stroke style.
const RAIN_MARK =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f7ba0" ' +
  'stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px">' +
  '<path d="M7 15a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17 15"/>' +
  '<path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/></svg>';

/** Builds a printable HTML report and opens it in a new tab for Save-as-PDF. */
export function openReport(field: FieldConfig, lang: Lang) {
  const crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);
  const tot = seasonTotals(field);
  const s = dayStatus(field);
  const log = [...(field.log ?? [])].reverse();
  const last = lastEventDate(field);

  // per-event water accounting: volume applied at each watering (m³)
  let totalApplied = 0;
  let wateredCount = 0;
  let rainCount = 0;
  const rows = log
    .map((e) => {
      const st = dayStatus(field, new Date(e.date));
      let vol = '';
      if (e.type === 'watered') {
        wateredCount++;
        const m3 = st.inSeason ? st.litersPerIrrigation / 1000 : 0;
        totalApplied += m3;
        vol = st.inSeason ? `${formatNum(m3, lang)} ${t('m3', lang)}` : '—';
      } else {
        rainCount++;
        vol = RAIN_MARK;
      }
      return `<tr><td>${formatDate(new Date(e.date), lang)}</td><td>${e.type === 'rain' ? t('typeRain', lang) : t('typeWatered', lang)}</td><td style="text-align:right">${vol}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${t('reportTitle', lang)} — Tomchi</title>
<style>
  @page { margin: 18mm; }
  * { font-family: 'Segoe UI', Arial, sans-serif; color: #0c2e38; }
  body { margin: 0; }
  .head { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #0f7ba0; padding-bottom: 12px; }
  .head img { width: 54px; height: 54px; border-radius: 12px; }
  h1 { font-size: 22px; margin: 0; color: #0a5570; }
  .sub { color: #0f7ba0; font-size: 13px; }
  h2 { font-size: 15px; color: #0a5570; margin: 22px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td, th { border: 1px solid #dde5f0; padding: 7px 10px; text-align: left; }
  th { background: #f0f3fa; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; }
  .grid div { display: flex; justify-content: space-between; border-bottom: 1px dashed #dde5f0; padding: 5px 0; }
  .big { font-size: 20px; font-weight: 700; color: #0a5570; }
  .foot { margin-top: 28px; font-size: 11px; color: #6b8b93; }
</style></head><body>
  <div class="head">
    <img src="/tomchi.png" alt="">
    <div>
      <h1>${t('reportTitle', lang)}</h1>
      <div class="sub">Tomchi — ${t('tagline', lang)}</div>
    </div>
  </div>
  <h2>${t('reportField', lang)}</h2>
  <div class="grid">
    <div><span>${t('stepCrop', lang)}</span><b>${crop.name[lang]}</b></div>
    <div><span>${t('stepRegion', lang)}</span><b>${region.name[lang]}</b></div>
    <div><span>${t('stepArea', lang)}</span><b>${formatNum(field.areaHa, lang)} ${t('hectare', lang)}</b></div>
    <div><span>${t('stepMethod', lang)}</span><b>${t(methodLabel[field.method], lang)}</b></div>
    <div><span>${t('stepSoil', lang)}</span><b>${t('soil_' + field.soil, lang)}</b></div>
    <div><span>${t('stageNow', lang)}</span><b>${s.inSeason ? t('stage_' + s.stage, lang) : t('stage_off', lang)}</b></div>
  </div>

  <h2>${t('reportSeasonNeed', lang)}</h2>
  <div class="grid">
    <div><span>${t('seasonTotal', lang)}</span><b class="big">${formatNum(tot.m3Field, lang)} ${t('m3', lang)}</b></div>
    <div><span>${t('waterSavedSeason', lang)} (${t('vsFlood', lang)})</span><b>${formatNum(tot.m3Saved, lang)} ${t('m3', lang)}</b></div>
  </div>

  <h2>${t('reportUsage', lang)}</h2>
  <div class="grid">
    <div><span>${t('reportWaterings', lang)}</span><b>${wateredCount}</b></div>
    <div><span>${t('reportRains', lang)}</span><b>${rainCount}</b></div>
    <div><span>${t('reportApplied', lang)}</span><b class="big">${formatNum(totalApplied, lang)} ${t('m3', lang)}</b></div>
    <div><span>${t('reportSavedMoney', lang)}</span><b>${formatNum(tot.m3Saved * SOM_PER_M3, lang)} ${t('som', lang)}</b></div>
  </div>

  <h2>${t('history', lang)}</h2>
  ${log.length ? `<table><thead><tr><th>${t('reportDate', lang)}</th><th>${t('reportEvent', lang)}</th><th style="text-align:right">${t('reportVolume', lang)}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p>${t('noHistory', lang)}</p>`}
  ${last ? `<p style="font-size:12px;color:#6b8b93">${t('lastWatered', lang)}: ${formatDate(new Date(last), lang)}</p>` : ''}

  <p class="foot">${t('methodology', lang)}<br>${t('reportGenerated', lang)}: ${formatDate(new Date(), lang)} · awards.gov.uz/pta</p>
</body></html>`;

  // Print via a hidden same-origin iframe. A popup (window.open) gets silently
  // blocked by browsers, and an inline onclick="print()" is blocked by our CSP
  // (script-src 'self'), so neither reliably fired — hence "nothing happens".
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  frame.srcdoc = html;

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    // Remove after the print dialog has had a chance to open.
    setTimeout(() => frame.remove(), 1000);
  };

  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) { frame.remove(); return; }
    win.addEventListener('afterprint', cleanup);
    // Give the browser a tick to lay out the image/fonts before printing.
    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        frame.remove();
      }
      // Fallback cleanup if afterprint never fires (some browsers/PDF flows).
      setTimeout(cleanup, 60_000);
    }, 250);
  };

  document.body.appendChild(frame);
}
