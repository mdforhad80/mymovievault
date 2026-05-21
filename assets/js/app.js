import { fetchTrending, fetchPopularMovies, fetchPopularTV, fetchTopRated, fetchUpcoming, IMG_BASE, IMG_W500 } from './tmdb.js';
import { createCard, showSkeletons } from './ui.js';
import { getContinueWatching } from './storage.js';

export function initHeader() {
  const header = document.querySelector('.site-header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = current;
  });
  
  // Mobile menu
  document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.main-nav')?.classList.toggle('active');
  });
}

export function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const toggle = document.querySelector('.search-toggle');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const suggestions = document.getElementById('searchSuggestions');
  
  if (!toggle || !overlay) return;
  
  toggle.addEventListener('click', () => {
    overlay.classList.add('active');
    input?.focus();
  });
  
  close?.addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  let debounce;
  input?.addEventListener('input', (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      if (e.target.value.length > 2) {
        fetchSuggestions(e.target.value);
      }
    }, 300);
  });
  
  async function fetchSuggestions(query) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=e10da2e2cbb23ea7ebfb64c3a188b64a&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      renderSuggestions(data.results.slice(0, 6));
    } catch (e) {
      console.error(e);
    }
  }
  
  function renderSuggestions(results) {
    suggestions.innerHTML = '';
    results.forEach(item => {
      if (!item.poster_path && !item.profile_path) return;
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      const img = item.poster_path || item.profile_path;
      const title = item.title || item.name;
      const type = item.media_type === 'movie' ? 'movie' : item.media_type === 'tv' ? 'tv' : 'person';
      
      div.innerHTML = `
        <img src="${IMG_W500}${img}" alt="${title}">
        <div>
          <div style="font-weight:600">${title}</div>
          <div style="font-size:0.8rem;color:var(--muted);text-transform:capitalize">${type}</div>
        </div>
      `;
      
      div.addEventListener('click', () => {
        if (type === 'movie') window.location.href = `movie.html?id=${item.id}`;
        else if (type === 'tv') window.location.href = `show.html?id=${item.id}`;
        else window.location.href = `creator.html?id=${item.id}`;
      });
      
      suggestions.appendChild(div);
    });
  }
}

async function initHome() {
  const heroBackdrop = document.getElementById('heroBackdrop');
  const heroTitle = document.getElementById('heroTitle');
  const heroOverview = document.getElementById('heroOverview');
  const heroWatch = document.getElementById('heroWatch');
  const heroInfo = document.getElementById('heroInfo');
  
  // Continue Watching
  const cw = getContinueWatching();
  if (cw.length > 0) {
    const section = document.getElementById('continueSection');
    const row = document.getElementById('continueRow');
    section.style.display = 'block';
    cw.forEach(item => {
      const card = createCard(item, item.type);
      const badge = document.createElement('div');
      badge.className = 'continue-badge';
      badge.innerHTML = `<div class="continue-progress" style="width:${item.progress || 30}%"></div>`;
      card.appendChild(badge);
      row.appendChild(card);
    });
  }
  
  // Trending
  const trendingRow = document.getElementById('trendingRow');
  showSkeletons(trendingRow, 6);
  const trending = await fetchTrending();
  trendingRow.innerHTML = '';
  trending.results.slice(0, 10).forEach((item, i) => {
    if (item.media_type !== 'movie' && item.media_type !== 'tv') return;
    if (i === 0 && heroBackdrop) {
      heroBackdrop.style.backgroundImage = `url(${IMG_BASE}${item.backdrop_path})`;
      heroTitle.textContent = item.title || item.name;
      heroOverview.textContent = item.overview?.substring(0, 150) + '...';
      const type = item.media_type;
      heroWatch.href = type === 'movie' 
        ? `watch.html?id=${item.id}&type=movie&server=vidplus`
        : `watch.html?id=${item.id}&type=tv&season=1&episode=1&server=vidplus`;
      heroInfo.href = type === 'movie' ? `movie.html?id=${item.id}` : `show.html?id=${item.id}`;
    }
    trendingRow.appendChild(createCard(item, item.media_type));
  });
  
  // Popular Movies
  const popMoviesRow = document.getElementById('popularMoviesRow');
  showSkeletons(popMoviesRow, 6);
  const popMovies = await fetchPopularMovies();
  popMoviesRow.innerHTML = '';
  popMovies.results.forEach(m => popMoviesRow.appendChild(createCard(m, 'movie')));
  
  // Popular TV
  const popTVRow = document.getElementById('popularTVRow');
  showSkeletons(popTVRow, 6);
  const popTV = await fetchPopularTV();
  popTVRow.innerHTML = '';
  popTV.results.forEach(t => popTVRow.appendChild(createCard(t, 'tv')));
  
  // Top Rated
  const topRow = document.getElementById('topRatedRow');
  showSkeletons(topRow, 6);
  const topRated = await fetchTopRated();
  topRow.innerHTML = '';
  topRated.results.forEach(m => topRow.appendChild(createCard(m, 'movie')));
  
  // Upcoming
  const upRow = document.getElementById('upcomingRow');
  showSkeletons(upRow, 6);
  const upcoming = await fetchUpcoming();
  upRow.innerHTML = '';
  upcoming.results.forEach(m => upRow.appendChild(createCard(m, 'movie')));
}

// Initialize
initHeader();
initSearch();
if (document.getElementById('heroSection')) {
  initHome();
}
