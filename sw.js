const CACHE = 'flipper-signal-db-v1';
const STATIC = [
  '/flipper-signal-db/',
  '/flipper-signal-db/index.html',
  '/flipper-signal-db/signals.json',
  '/flipper-signal-db/signals_files.json',
  '/flipper-signal-db/manifest.json',
  '/flipper-signal-db/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-first for signals.json and signals_files.json so updates propagate
  if (url.pathname.endsWith('signals.json') || url.pathname.endsWith('signals_files.json')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
      return r;
    }))
  );
});
