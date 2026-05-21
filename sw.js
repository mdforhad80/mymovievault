const CACHE = "movie-stream-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/movie.html",
  "/show.html",
  "/watch.html",
  "/search.html",
  "/trending.html",
  "/movies.html",
  "/tv.html",
  "/schedule.html",
  "/creator.html",
  "/assets/css/style.css",
  "/assets/js/app.js",
  "/assets/js/tmdb.js",
  "/assets/js/ui.js",
  "/assets/js/storage.js",
  "/assets/js/player.js",
  "/assets/js/movie.js",
  "/assets/js/tv.js",
  "/assets/js/search.js",
  "/assets/js/router.js",
  "/assets/js/api.js",
  "/assets/js/utils.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).then((fetchRes) => {
        if (fetchRes.ok && e.request.method === 'GET') {
          const clone = fetchRes.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return fetchRes;
      });
    }).catch(() => {
      if (e.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
