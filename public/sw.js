const CACHE_NAME = 'lina-ai-shell-v2';
const APP_SHELL = ['/', '/manifest.webmanifest'];
const CACHEABLE_DESTINATIONS = new Set(['document', 'script', 'style', 'image', 'font']);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith('lina-ai-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Network-first for the app shell and assets so deployments cannot be hidden
  // behind an older cached JavaScript bundle. Cache remains an offline fallback.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && CACHEABLE_DESTINATIONS.has(request.destination)) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        return (await caches.match('/')) || Response.error();
      }
      return Response.error();
    }
  })());
});
