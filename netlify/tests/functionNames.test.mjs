// Netlify turns every file in netlify/functions into a serverless function, and
// rejects any whose name is not alphanumeric, hyphen or underscore. A stray
// `something.test.mjs` there fails the entire deploy at the very last stage,
// after a clean build — so the site silently keeps serving the old bundle.
//
// That is a slow, expensive way to learn about a filename. Catch it here.
import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const FUNCTIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'functions');
const DEPLOYABLE = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts']);
const VALID_NAME = /^[A-Za-z0-9_-]+$/;

const entries = readdirSync(FUNCTIONS_DIR)
  .filter((name) => statSync(join(FUNCTIONS_DIR, name)).isFile())
  .filter((name) => DEPLOYABLE.has(extname(name)));

describe('netlify/functions filenames', () => {
  it('finds the functions directory', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s is a name Netlify will accept', (name) => {
    expect(basename(name, extname(name))).toMatch(VALID_NAME);
  });

  it('holds no test files, which would deploy as broken functions', () => {
    const tests = entries.filter((name) => /\.(test|spec)\./.test(name));
    expect(tests).toEqual([]);
  });
});
