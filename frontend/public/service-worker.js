const CACHE_NAME = 'ke-crm-v1';
const ASSETS_TO_CACHE = [
  '/admin',
  '/logo.jpeg',
  '/manifest.json'
];

// Install Event - cache core shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network-first for pages, bypass cache for API calls
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Bypass cache for API calls
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache successful requests for shell resources
        if (response.status === 200 && e.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
