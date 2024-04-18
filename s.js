importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js');

const OFFLINE_VERSION = 1;
const cacheName = 'offline';
const cachedAssets = [
  './index.js',
  './styles.css',
  './192.webp',
  './512.png'
];
const OFFLINE_URL = './offline.html';

// Precaching assets during installation
workbox.precaching.precacheAndRoute(cachedAssets);

// Cache the offline URL during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

// Clear old caches during activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Claim clients to immediately start controlling all pages
  self.clients.claim();
});

// Fetch event handling with Workbox caching strategies
const networkOnlyStrategy = new workbox.strategies.NetworkOnly();
const navigationRoute = new workbox.routing.NavigationRoute(networkOnlyStrategy);

self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          console.log('Service Worker: Cached response found');
          return cachedResponse;
        }
        
        // Use Workbox navigation route for HTML requests
        if (event.request.mode === 'navigate') {
          return navigationRoute.handler({ event });
        }

        // Use network first strategy for other requests
        return networkOnlyStrategy.handle({ event });
      })
      .catch(() => {
        // If no cached response is found, serve the offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

// Function to calculate distance between two points (Haversine formula)
function calculateDistance(point1, point2) {
  const earthRadius = 6371000; // Earth's radius in meters
  const lat1 = deg2rad(point1.latitude);
  const lat2 = deg2rad(point2.latitude);
  const deltaLat = deg2rad(point2.latitude - point1.latitude);
  const deltaLon = deg2rad(point2.longitude - point1.longitude);

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = earthRadius * c;

  return distance;
}

// Function to convert degrees to radians
function deg2rad(degrees) {
  return degrees * (Math.PI/180);
}

// Geofencing functionality
const geofences = [
  {
    center: { latitude: 28.610254, longitude: -81.430840 }, // Orlando, FL
    radius: 100 // 100 meters 
  },
  {
    center: { latitude: 29.196925, longitude: -82.140385 }, // Brothers, FL
    radius: 100 // 100 meters 
  },
  {
    center: { latitude: 28.600453, longitude: -82.122522 }, // Ocala, FL
    radius: 100 // 100 meters
  },
  {
    center: { latitude: 25.761680, longitude: -81.436783 }, // Rosemont, FL
    radius: 100 // 100 meters
  }
];

// Monitor geofence events for each geofence
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.error('Fetch failed; returning offline page instead.', error);
          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } else {
    const userLocation = { latitude: 28.6014, longitude: -81.1977 }; // Example user location (can be obtained dynamically)
    let insideGeofence = false;
    geofences.forEach(geofence => {
      const distance = calculateDistance(userLocation, geofence.center);
      if (distance <= geofence.radius) {
        // User is within geofence, set flag
        insideGeofence = true;
      }
    });

    if (insideGeofence) {
      // User is within at least one geofence
      console.log('User is within the geofence');
    } else {
      // User is not within any geofence, send notification
      console.log('User is outside all geofences, sending notification');
      sendNotification("You've left the geofence area.");
    }
  }
});
