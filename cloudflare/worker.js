const TMDB_API_KEY = 'e10da2e2cbb23ea7ebfb64c3a188b64a';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function handleRequest(request) {
  const url = new URL(request.url);
  // Expected path: /api/tmdb/path?query...
  const path = url.pathname.replace('/api/tmdb', '');
  const query = url.search;
  const apiUrl = `${TMDB_BASE}${path}${query}&api_key=${TMDB_API_KEY}`;

  const response = await fetch(apiUrl, { headers: { 'User-Agent': 'CineStream' } });
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
