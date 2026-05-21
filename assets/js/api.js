// api.js – All TMDB API calls through the Worker proxy
const API_PROXY = '/api/tmdb';

async function apiFetch(endpoint, params = {}) {
  const url = new URL(`${window.location.origin}${API_PROXY}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Movie endpoints
function getPopularMovies(page = 1) {
  return apiFetch('/movie/popular', { page });
}
function getTrendingMovies(timeWindow = 'day') {
  return apiFetch('/trending/movie/' + timeWindow);
}
function getNowPlayingMovies(page = 1) {
  return apiFetch('/movie/now_playing', { page });
}
function getUpcomingMovies(page = 1) {
  return apiFetch('/movie/upcoming', { page });
}
function getMovieDetails(id) {
  return apiFetch(`/movie/${id}`);
}
function getMovieRecommendations(id) {
  return apiFetch(`/movie/${id}/recommendations`);
}
function getMovieVideos(id) {
  return apiFetch(`/movie/${id}/videos`);
}

// TV endpoints
function getPopularTV(page = 1) {
  return apiFetch('/tv/popular', { page });
}
function getTrendingTV(timeWindow = 'day') {
  return apiFetch('/trending/tv/' + timeWindow);
}
function getAiringTodayTV(page = 1) {
  return apiFetch('/tv/airing_today', { page });
}
function getOnTheAirTV(page = 1) {
  return apiFetch('/tv/on_the_air', { page });
}
function getTVDetails(id) {
  return apiFetch(`/tv/${id}`);
}
function getTVSeason(id, seasonNumber) {
  return apiFetch(`/tv/${id}/season/${seasonNumber}`);
}
function getTVRecommendations(id) {
  return apiFetch(`/tv/${id}/recommendations`);
}

// Search
function searchMulti(query, page = 1) {
  return apiFetch('/search/multi', { query, page });
}
function searchMovies(query, page = 1) {
  return apiFetch('/search/movie', { query, page });
}
function searchTV(query, page = 1) {
  return apiFetch('/search/tv', { query, page });
}

// Discover (with filters)
function discoverMovie(params = {}) {
  return apiFetch('/discover/movie', params);
}
function discoverTV(params = {}) {
  return apiFetch('/discover/tv', params);
}

// Genres
function getMovieGenres() {
  return apiFetch('/genre/movie/list');
}
function getTVGenres() {
  return apiFetch('/genre/tv/list');
}
