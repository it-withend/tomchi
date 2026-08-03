import { describe, it, expect } from 'vitest';
import { dict, fmt, t, formatNum, type Lang } from './i18n';

const LANGS: Lang[] = ['uz', 'ru'];

/** The `%s` / `%d` markers in a string, in the order `fmt` will consume them. */
const slots = (s: string) => s.match(/%[ds]/g) ?? [];

describe('translation slots', () => {
  // fmt() fills markers positionally, so the two languages must agree on how
  // many arguments a string takes. When they disagree the caller passes the
  // right number for one language and the other silently drops an argument or
  // prints an empty one — a defect no type checker sees.
  const keys = Object.keys(dict);

  it.each(keys)('%s takes the same arguments in both languages', (key) => {
    expect(slots(dict[key].uz).length).toBe(slots(dict[key].ru).length);
  });

  it('has no half-written markers left behind', () => {
    // `{0}`-style placeholders belong to a different formatter and would be
    // printed literally by this one.
    const braces = keys.filter((k) => LANGS.some((l) => /\{\d+\}/.test(dict[k][l])));
    expect(braces).toEqual([]);
  });

  it('leaves no entry empty in either language', () => {
    const blank = keys.filter((k) => LANGS.some((l) => dict[k][l].trim() === ''));
    expect(blank).toEqual([]);
  });
});

describe('fmt', () => {
  it('fills markers left to right', () => {
    expect(fmt('%s м³ воды, примерно %s минут', 486, 30)).toBe('486 м³ воды, примерно 30 минут');
  });

  it('treats %d and %s alike, because callers already mix them', () => {
    expect(fmt('каждые %d дней', 8)).toBe('каждые 8 дней');
  });

  it('prints nothing rather than "undefined" when an argument is missing', () => {
    expect(fmt('%s и %s', 'один')).toBe('один и ');
  });

  it('leaves a string without markers untouched', () => {
    expect(fmt('Полил')).toBe('Полил');
  });
});

describe('t', () => {
  it('returns the entry for the asked language', () => {
    expect(t('hectare', 'ru')).toBe('га');
    expect(t('hectare', 'uz')).toBe('gektar');
  });

  it('returns the key itself when there is no entry, so the gap is visible', () => {
    expect(t('no_such_key', 'ru')).toBe('no_such_key');
  });
});

describe('formatNum', () => {
  it('keeps one decimal below ten and none above, so columns stay readable', () => {
    expect(formatNum(3.24, 'ru')).toBe('3,2');
    expect(formatNum(4630.4, 'ru')).toMatch(/^4\s?630$/);
  });

  it('applies the same rounding rule in Uzbek', () => {
    // Both locales use a comma for decimals, so only the digit count differs
    // from the raw number — that is the part worth pinning down.
    expect(formatNum(3.24, 'uz')).toBe('3,2');
    expect(formatNum(486, 'uz')).toBe('486');
  });
});
