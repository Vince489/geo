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
  console.log('Service Worker: Fetching')
  event.respondWith(
    fetch(event.request)
    .catch(() => caches.match(event.request))
  )
});
