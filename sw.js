self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('geofence').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/app.js',
        '/src/styles.css',
        '/images/512.png'
      ]);
    })
  );
});

self.addEventListener('activate', e => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', e => {
  console.log('Service Worker: Fetching', e.request.url);
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
  });
