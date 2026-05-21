import { fetchTV, fetchTVSeason, IMG_BASE, IMG_W500 } from './tmdb.js';
import { createCard, createCastCard, formatDate } from './ui.js';
import { addContinueWatching, addToHistory } from './storage.js';
import { initHeader, initSearch } from './app.js';

initHeader();
initSearch();

const params = new URLSearchParams(location.search);
const id = params.get('id');
let currentSeason = 1;

async function loadShow() {
  const data = await fetchTV(id);
  
  document.title = `${data.name} - StreamVault`;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.name);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', `${IMG_BASE}${data.backdrop_path}`);
  
  document.getElementById('detailBackdrop').style.backgroundImage = `url(${IMG_BASE}${data.backdrop_path})`;
  document.getElementById('detailPoster').innerHTML = `<img src="${IMG_W500}${data.poster_path}" alt="${data.name}">`;
  document.getElementById('detailTitle').textContent = data.name;
  
  const networks = data.networks?.map(n => n.name).join(', ');
  document.getElementById('detailMeta').innerHTML = `
    <span>${formatDate(data.first_air_date)}</span>
    <span>${data.number_of_seasons} Seasons</span>
    <span>${data.episode_run_time?.[0] ? data.episode_run_time[0] + 'm' : ''}</span>
    <span>★ ${data.vote_average?.toFixed(1)}</span>
    ${networks ? `<span>${networks}</span>` : ''}
  `;
  
  document.getElementById('detailTagline').textContent = data.tagline || '';
  document.getElementById('detailOverview').textContent = data.overview;
  
  const genresContainer = document.getElementById('detailGenres');
  data.genres?.forEach(g => {
    const tag = document.createElement('span');
    tag.className = 'genre-tag';
    tag.textContent = g.name;
    genresContainer.appendChild(tag);
  });
  
  const watchBtn = document.getElementById('watchBtn');
  watchBtn.href = `watch.html?id=${id}&type=tv&season=1&episode=1&server=vidplus`;
  watchBtn.addEventListener('click', () => {
    addContinueWatching({
      id, type: 'tv', title: data.name,
      poster_path: data.poster_path,
      season: 1, episode: 1, progress: 0
    });
    addToHistory({ id, type: 'tv', title: data.name, poster_path: data.poster_path });
  });
  
  // Trailer
  const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  if (trailer) {
    document.getElementById('trailerBtn').addEventListener('click', () => {
      const modal = document.getElementById('trailerModal');
      document.getElementById('trailerContainer').innerHTML = 
        `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allowfullscreen></iframe>`;
      modal.classList.add('active');
    });
  } else {
    document.getElementById('trailerBtn').style.display = 'none';
  }
  
  document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('trailerModal').classList.remove('active');
    document.getElementById('trailerContainer').innerHTML = '';
  });
  
  // Seasons selector
  const seasonsContainer = document.getElementById('seasonsSelector');
  data.seasons?.forEach(s => {
    if (s.season_number === 0) return;
    const btn = document.createElement('button');
    btn.className = `season-btn ${s.season_number === 1 ? 'active' : ''}`;
    btn.textContent = `Season ${s.season_number}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadEpisodes(s.season_number);
    });
    seasonsContainer.appendChild(btn);
  });
  
  await loadEpisodes(1);
  
  // Cast
  const castRow = document.getElementById('castRow');
  data.credits?.cast?.slice(0, 10).forEach(p => {
    castRow.appendChild(createCastCard(p));
  });
  
  // Recommendations
  const recRow = document.getElementById('recommendationsRow');
  data.recommendations?.results?.slice(0, 10).forEach(s => {
    recRow.appendChild(createCard(s, 'tv'));
  });
}

async function loadEpisodes(seasonNum) {
  currentSeason = seasonNum;
  const grid = document.getElementById('episodesGrid');
  grid.innerHTML = '<div class="spinner" style="margin:2rem auto"></div>';
  
  try {
    const data = await fetchTVSeason(id, seasonNum);
    grid.innerHTML = '';
    
    data.episodes?.forEach(ep => {
      const card = document.createElement('div');
      card.className = 'episode-card';
      const still = ep.still_path ? `${IMG_W500}${ep.still_path}` : 'assets/images/placeholder.jpg';
      
      card.innerHTML = `
        <img src="${still}" alt="${ep.name}">
        <div class="episode-info">
          <div class="episode-number">Episode ${ep.episode_number}</div>
          <div class="episode-title">${ep.name}</div>
          <div class="episode-date">${formatDate(ep.air_date)}</div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        addContinueWatching({
          id, type: 'tv', title: document.getElementById('detailTitle').textContent,
          poster_path: document.querySelector('.detail-poster img')?.src.split('/').pop(),
          season: seasonNum, episode: ep.episode_number, progress: 0
        });
        window.location.href = `watch.html?id=${id}&type=tv&season=${seasonNum}&episode=${ep.episode_number}&server=vidplus`;
      });
      
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = '<p style="text-align:center;color:var(--muted)">Failed to load episodes.</p>';
  }
}

loadShow().catch(console.error);
