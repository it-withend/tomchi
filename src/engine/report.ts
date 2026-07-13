import { t, formatNum, formatDate, type Lang } from '../i18n';
import { getCrop, getRegion, seasonTotals, dayStatus, lastEventDate, type FieldConfig } from './irrigation';

const methodLabel: Record<string, string> = { furrow: 'furrow', sprinkler: 'sprinkler', drip: 'drip' };

/** Builds a printable HTML report and opens it in a new tab for Save-as-PDF. */
export function openReport(field: FieldConfig, lang: Lang) {
  const crop = getCrop(field.cropId);
  const region = getRegion(field.regionId);
  const tot = seasonTotals(field);
  const s = dayStatus(field);
  const log = [...(field.log ?? [])].reverse();
  const last = lastEventDate(field);

  const rows = log
    .map((e) => `<tr><td>${formatDate(new Date(e.date), lang)}</td><td>${e.type === 'rain' ? t('typeRain', lang) : t('typeWatered', lang)}</td></tr>`)
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
  td, th { border: 1px solid #d5e5e9; padding: 7px 10px; text-align: left; }
  th { background: #eef6f7; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; }
  .grid div { display: flex; justify-content: space-between; border-bottom: 1px dashed #d5e5e9; padding: 5px 0; }
  .big { font-size: 20px; font-weight: 700; color: #0a5570; }
  .foot { margin-top: 28px; font-size: 11px; color: #6b8b93; }
  button { margin: 16px 0; padding: 10px 18px; background: #0f7ba0; color: #fff; border: 0; border-radius: 8px; font-size: 14px; cursor: pointer; }
  @media print { button { display: none; } }
</style></head><body>
  <div class="head">
    <img src="/tomchi.png" alt="">
    <div>
      <h1>${t('reportTitle', lang)}</h1>
      <div class="sub">Tomchi — ${t('tagline', lang)}</div>
    </div>
  </div>
  <button onclick="window.print()">${t('reportPrint', lang)}</button>
  <h2>${t('reportField', lang)}</h2>
  <div class="grid">
    <div><span>${crop.emoji} ${t('stepCrop', lang)}</span><b>${crop.name[lang]}</b></div>
    <div><span>${t('stepRegion', lang)}</span><b>${region.name[lang]}</b></div>
    <div><span>${t('stepArea', lang)}</span><b>${formatNum(field.areaHa, lang)} ${t('hectare', lang)}</b></div>
    <div><span>${t('stepMethod', lang)}</span><b>${t(methodLabel[field.method], lang)}</b></div>
    <div><span>${t('stepSoil', lang)}</span><b>${t('soil_' + field.soil, lang)}</b></div>
    <div><span>${t('stageNow', lang)}</span><b>${s.inSeason ? t('stage_' + s.stage, lang) : t('stage_off', lang)}</b></div>
  </div>

  <h2>${t('reportSeasonNeed', lang)}</h2>
  <div class="grid">
    <div><span>${t('seasonTotal', lang)}</span><b class="big">${formatNum(tot.m3Field, lang)} m³</b></div>
    <div><span>${t('waterSavedSeason', lang)} (${t('vsFlood', lang)})</span><b>${formatNum(tot.m3Saved, lang)} m³</b></div>
  </div>

  <h2>${t('history', lang)}</h2>
  ${log.length ? `<table><thead><tr><th>${t('reportGenerated', lang)}</th><th>${t('typeWatered', lang)}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p>${t('noHistory', lang)}</p>`}
  ${last ? `<p style="font-size:12px;color:#6b8b93">${t('lastWatered', lang)}: ${formatDate(new Date(last), lang)}</p>` : ''}

  <p class="foot">${t('methodology', lang)}<br>${t('reportGenerated', lang)}: ${formatDate(new Date(), lang)} · awards.gov.uz/pta</p>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
