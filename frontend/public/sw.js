const STATIC_CACHE_NAME = 'pratibha-static-v1';
const API_CACHE_NAME = 'pratibha-api-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/splash-illustration.jpg',
  '/ai-avatar.jpg',
  '/pratibha-icon.svg',
  '/child-aarav.png',
  '/child-ananya.png',
  '/child-dev.png',
  '/child-meera.png',
  '/child-rani.png',
  '/child-rohan.png',
  '/worker-sunita.png',
];

// Install Event: open static cache and pre-cache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static shell assets');
      
      const cachePromises = PRECACHE_ASSETS.map((url) => {
        // Use no-cache to fetch fresh assets
        return fetch(new Request(url, { cache: 'no-cache' }))
          .then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
            throw new Error(`Failed to precache: ${url}`);
          })
          .catch((err) => {
            console.warn(`[Service Worker] Pre-cache warning for ${url}:`, err);
          });
      });
      return Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

// Activate Event: clean up deprecated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event interception
self.addEventListener('fetch', (event) => {
  // We only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Ignore cross-origin requests unless they are specific static dependencies
  if (url.origin !== self.location.origin) {
    // If it's a request to Google Fonts or other CDN assets, we can cache-first it
    if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
      );
    }
    return;
  }

  // 1. Navigation Requests (Page Navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update dynamic navigation cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails (offline), fall back to cached index.html
          return caches.match('/index.html').then((cachedIndex) => {
            if (cachedIndex) return cachedIndex;
            // If index.html is missing, fall back to offline.html
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // 2. API Requests (e.g., /api/children)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // On network success, store clone in API cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // On network failure, retrieve from API cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Otherwise return offline JSON error
            return new Response(
              JSON.stringify({ error: 'Network unavailable. Running offline with no cached data.' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // 3. Static Assets Requests (CSS, JS, Images, Icons, Manifest)
  const isStaticAsset = 
    PRECACHE_ASSETS.includes(url.pathname) ||
    url.pathname.startsWith('/src/') || // Vite source paths in dev mode
    url.pathname.startsWith('/assets/') || // Build build paths
    url.pathname.match(/\.(js|ts|tsx|jsx|css|png|jpg|jpeg|svg|gif|ico|woff2|woff|ttf|json|webmanifest)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Cache hit: return resource immediately
          return cachedResponse;
        }

        // Cache miss: fetch from network and cache for next time
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch((err) => {
            console.error(`[Service Worker] Static resource fetch failed for: ${url.pathname}`, err);
            // If image fails, fallback can be handled or just fail
            return new Response('Asset not available offline', { status: 404 });
          });
      })
    );
    return;
  }

  // 4. Default strategy: Network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
