const API_BASE = '/api/tmdb';  // Worker proxy

async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

// Common fetchers
async function getMovie(id) { return fetchFromTMDB(`/movie/${id}`); }
async function getTV(id) { return fetchFromTMDB(`/tv/${id}`); }
async function getSeason(id, seasonNum) { return fetchFromTMDB(`/tv/${id}/season/${seasonNum}`); }
// etc.
