import { describe, it, expect } from 'vitest';
import { buildReportHtml } from './report';
import type { FieldConfig } from './irrigation';

// The report is the document a farmer prints and hands to the hokimiyat, so
// wrong or missing figures in it are not a cosmetic problem.
const field: FieldConfig = {
  id: 'f1',
  regionId: 'bukhara',
  cropId: 'cotton',
  areaHa: 3.2,
  method: 'furrow',
  soil: 'loam',
  log: [
    { date: '2026-06-20', type: 'watered' },
    { date: '2026-06-28', type: 'rain' },
    { date: '2026-07-06', type: 'watered' },
  ],
};

const bare: FieldConfig = { ...field, log: [] };

describe('buildReportHtml', () => {
  it('produces a complete standalone document', () => {
    const html = buildReportHtml(field, 'ru');
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html.trimEnd().endsWith('</html>')).toBe(true);
  });

  it('never prints a placeholder where a number belongs', () => {
    for (const lang of ['uz', 'ru'] as const) {
      const html = buildReportHtml(field, lang);
      expect(html).not.toMatch(/NaN|undefined|null|Infinity/);
    }
  });

  it('names the field in the reader\'s language', () => {
    expect(buildReportHtml(field, 'ru')).toContain('Хлопчатник');
    expect(buildReportHtml(field, 'uz')).toContain('Paxta');
  });

  it('counts waterings and rains separately', () => {
    const html = buildReportHtml(field, 'ru');
    // Two waterings and one rain, each a row in the history table.
    expect(html.match(/<tr><td>/g)).toHaveLength(3);
  });

  it('writes the volume unit in the reader\'s alphabet', () => {
    expect(buildReportHtml(field, 'ru')).toContain('м³');
    expect(buildReportHtml(field, 'uz')).toContain('m³');
  });

  it('says so plainly when the field has no history yet', () => {
    const html = buildReportHtml(bare, 'ru');
    expect(html).not.toContain('<table>');
    expect(html).not.toMatch(/NaN|undefined/);
  });

  it('escapes nothing it does not control, because no field is free text', () => {
    // Region, crop, method and soil are all ids resolved through our own
    // tables; the only farmer-entered value is the area, a number.
    const odd: FieldConfig = { ...field, areaHa: 0.01 };
    expect(buildReportHtml(odd, 'ru')).not.toContain('<script');
  });
});
