const OFFLINE_VERSION = 1;
const cacheName = 'offline';
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
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing Old Cache')
            return caches.delete(cache)
          }
        })
      )
    })
  
  )

});

self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching');
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // If a cached response is found, return it
          console.log('Service Worker: Cached response found');
          return cachedResponse;
        }

        // If no cached response is found, fetch from the network
        console.log('Service Worker: Fetching from network');
        return fetch(event.request)
          .then(networkResponse => {
            // Cache the fetched response
            const clonedResponse = networkResponse.clone();
            caches.open(cacheName)
              .then(cache => {
                cache.put(event.request, clonedResponse);
              });
            return networkResponse;
          })
          .catch(() => {
            // If fetching from the network fails, return a fallback response
            console.log('Service Worker: Fetch failed; serving offline fallback');
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

