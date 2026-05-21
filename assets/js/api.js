// Wrapper for potential Cloudflare Worker proxy usage
const USE_PROXY = false; // Set to true if deploying with Cloudflare Worker
const PROXY_URL = '/api/';

export async function apiFetch(endpoint) {
  if (USE_PROXY) {
    const res = await fetch(`${PROXY_URL}?endpoint=${encodeURIComponent(endpoint)}`);
    return res.json();
  }
  // Direct fetch handled in tmdb.js
  return null;
}
