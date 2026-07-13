// JSON-file persistence for bot subscribers. Simple and dependency-free —
// swap for a real DB when scaling past a single node.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = `${DIR}/data/subscribers.json`;

export type Lang = 'uz' | 'ru';
export type Method = 'furrow' | 'sprinkler' | 'drip';
export type Soil = 'sandy' | 'loam' | 'clay';

export interface Subscriber {
  chatId: number;
  lang: Lang;
  step: 'lang' | 'region' | 'crop' | 'method' | 'soil' | 'done';
  regionId?: string;
  cropId?: string;
  method?: Method;
  soil?: Soil;
  areaHa: number;
  lastWatered?: string;
  subscribed: boolean;
}

let cache: Record<string, Subscriber> = {};

export function load() {
  try {
    if (existsSync(FILE)) cache = JSON.parse(readFileSync(FILE, 'utf8'));
  } catch { cache = {}; }
  return cache;
}

function persist() {
  mkdirSync(`${DIR}/data`, { recursive: true });
  writeFileSync(FILE, JSON.stringify(cache, null, 2));
}

export function get(chatId: number): Subscriber | undefined {
  return cache[chatId];
}

export function upsert(chatId: number, patch: Partial<Subscriber>): Subscriber {
  const cur = cache[chatId] ?? { chatId, lang: 'uz', step: 'lang', areaHa: 1, subscribed: false };
  cache[chatId] = { ...cur, ...patch };
  persist();
  return cache[chatId];
}

export function all(): Subscriber[] {
  return Object.values(cache);
}
