const OFFLINE_VERSION = 1;
const cacheName = 'offline';
const OFFLINE_URL = '/index.html'; // Use absolute URLs

const cachedAssets = [
  './index.js',
  './styles.css',
  './192.webp',
  './512.png'
]

self.addEventListener('install', event => {

  event.waitUntil(
    caches
    .open(cacheName)
    .then(cache => {
      console.log('Service Worker: Caching Files')
      cache.addAll(cachedAssets)
    })
    .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed; returning offline page instead.', error);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })());
  }
});
