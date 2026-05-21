const CACHE_NAME = 'cinestream-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/movie.html',
  '/watch.html',
  '/search.html',
  '/schedule.html',
  '/creator.html',
  '/assets/css/style.css',
  '/assets/js/api.js',
  '/assets/js/ui.js',
  '/assets/js/storage.js',
  '/assets/js/app.js',
  '/assets/js/player.js',
  '/assets/js/movie.js',
  '/assets/js/search.js',
  '/assets/js/schedule.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
