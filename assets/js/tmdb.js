const API_KEY = "e10da2e2cbb23ea7ebfb64c3a188b64a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/original";
const IMG_W500 = "https://image.tmdb.org/t/p/w500";

export { IMG_BASE, IMG_W500 };

async function fetchTMDB(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

export async function fetchTrending() {
  return fetchTMDB('/trending/all/day');
}

export async function fetchPopularMovies(page = 1) {
  return fetchTMDB(`/movie/popular&page=${page}`);
}

export async function fetchPopularTV(page = 1) {
  return fetchTMDB(`/tv/popular&page=${page}`);
}

export async function fetchTopRated(page = 1) {
  return fetchTMDB(`/movie/top_rated&page=${page}`);
}

export async function fetchUpcoming(page = 1) {
  return fetchTMDB(`/movie/upcoming&page=${page}`);
}

export async function fetchAiringToday(page = 1) {
  return fetchTMDB(`/tv/airing_today&page=${page}`);
}

export async function fetchMovie(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits,recommendations,similar`
  );
  return res.json();
}

export async function fetchTV(id) {
  const res = await fetch(
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=videos,credits,recommendations,similar`
  );
  return res.json();
}

export async function fetchTVSeason(tvId, seasonNumber) {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMulti(query, page = 1) {
  return fetchTMDB(`/search/multi&query=${encodeURIComponent(query)}&page=${page}`);
}

export async function searchMovies(query, page = 1) {
  return fetchTMDB(`/search/movie&query=${encodeURIComponent(query)}&page=${page}`);
}

export async function searchTV(query, page = 1) {
  return fetchTMDB(`/search/tv&query=${encodeURIComponent(query)}&page=${page}`);
}
