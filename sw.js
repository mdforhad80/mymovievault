// ============================================
// SERVICE WORKER
// ============================================

const CACHE_NAME = 'animestream-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/anime.html',
  '/watch.html',
  '/search.html',
  '/schedule.html',
  '/creator.html',
  '/assets/css/style.css',
  '/assets/js/utils.js',
  '/assets/js/storage.js',
  '/assets/js/api.js',
  '/assets/js/ui.js',
  '/assets/js/search.js',
  '/assets/js/app.js',
  '/assets/js/anime.js',
  '/assets/js/player.js',
  '/assets/js/search-page.js',
  '/assets/js/schedule.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and API calls
  if (request.method !== 'GET') return;
  if (request.url.includes('api.jikan.moe')) return;
  if (request.url.includes('megaplay.buzz')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Return offline fallback for HTML pages
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
