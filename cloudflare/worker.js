// Cloudflare Worker – proxies TMDB API requests and hides API key
const TMDB_API_KEY = 'e10da2e2cbb23ea7ebfb64c3a188b64a';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function handleRequest(request) {
  const url = new URL(request.url);
  // Expected path: /api/tmdb/{endpoint}?query...
  let path = url.pathname.replace('/api/tmdb', '');
  // Remove trailing slash
  if (path.endsWith('/')) path = path.slice(0, -1);

  const queryString = url.search; // includes '?'
  const apiUrl = `${TMDB_BASE}${path}${queryString}${queryString ? '&' : '?'}api_key=${TMDB_API_KEY}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'CineStream/1.0',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, s-maxage=600'
    }
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
