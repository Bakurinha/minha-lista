const CACHE = 'minha-lista-v2-3-2';
const CORE = [
  './',
  './index.html',
  './app.js',
  './share-optimized-v230.js',
  './enhancements.js',
  './inventory.js',
  './reference-market-refresh.js',
  './reference-product-expansion-v230.js',
  './backup-v230.js',
  './list-enhancements.js',
  './list-market-v230.js',
  './db-integrity-v230.js',
  './db-migrations-v230.js',
  './version-v230.js',
  './v3-shell.js',
  './v3-icons.js',
  './v3-icon-force.js',
  './v3-compact-controls.js',
  './share-config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  )
);

self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then(
            (cached) =>
              cached ||
              (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
          )
      )
  );
});

// V2.3.2: novo cache + skipWaiting/clients.claim para atualização imediata sem tocar no IndexedDB.
