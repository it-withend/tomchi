// Tomchi offline cache.
//
// The user is a farmer standing in a field on a weak rural signal. The previous
// version was network-first for everything, so every launch waited on the
// network before showing what it already had. Now:
//
//   /assets/*   cache-first — Vite fingerprints these names, so a cached copy
//               can never be stale; a new build asks for new URLs.
//   navigation  network-first, falling back to the cached shell, so a deploy is
//               picked up as soon as there is any connectivity.
//   the rest of our origin: network-first, as before.
//
// Netlify functions are never cached. They are per-field queries whose answers
// differ by query string, and the app already caches the expensive one (NDVI)
// in localStorage under a key that includes the field's coordinates.
const SHELL = 'tomchi-shell-v2';
const ASSETS = 'tomchi-assets-v2';
const KEEP = [SHELL, ASSETS];

// Fingerprinted assets accumulate across deploys because their names never
// repeat. Keep the newest and drop the rest; cache.keys() is insertion-ordered.
const ASSET_LIMIT = 60;

const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/tomchi.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      // One missing shell entry must not strand the old worker forever.
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  const excess = keys.length - ASSET_LIMIT;
  if (excess > 0) await Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
}

/** Immutable build output: serve from cache, go to the network only on a miss. */
async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  if (hit) return hit;
  const fresh = await fetch(request);
  if (fresh.ok) {
    await cache.put(request, fresh.clone());
    await trim(cache);
  }
  return fresh;
}

/** Fresh when there is a network, the last known copy when there is not. */
async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(SHELL);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch {
    // Exact match only. Matching loosely here (ignoreSearch) once meant an
    // offline request for one field could be answered with another field's data.
    const hit = await cache.match(request) ?? (fallbackUrl ? await cache.match(fallbackUrl) : undefined);
    return hit ?? Response.error();
  }
}

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/.netlify/')) return;

  if (request.mode === 'navigate') {
    e.respondWith(networkFirst(request, '/index.html'));
  } else if (url.pathname.startsWith('/assets/')) {
    e.respondWith(cacheFirst(request));
  } else {
    e.respondWith(networkFirst(request));
  }
});
