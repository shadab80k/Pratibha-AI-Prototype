const CACHE_NAME = 'pratibha-ai-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/public/splash-illustration.jpg',
  '/public/ai-avatar.jpg',
  '/public/child-aarav.png',
  '/public/child-ananya.png',
  '/public/child-dev.png',
  '/public/child-meera.png',
  '/public/child-rani.png',
  '/public/child-rohan.png',
  '/public/worker-sunita.png',
];

// Install Service Worker and cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching shell assets');
      // Use no-cache option to ensure we get fresh files
      const cachePromises = ASSETS_TO_CACHE.map(url => {
        return fetch(new Request(url, { cache: 'no-cache' }))
          .then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
            throw new Error(`Failed to fetch: ${url}`);
          })
          .catch(err => {
            console.warn(`[Service Worker] Failed to cache initial asset: ${url}`, err);
          });
      });
      return Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept requests and fallback to cache when network is offline
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests from our own origin
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network response is good, dynamic cache it
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline), try match cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For client navigations fallback to SPA shell
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
