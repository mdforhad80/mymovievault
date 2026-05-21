import { fetchMovie, IMG_BASE, IMG_W500 } from './tmdb.js';
import { createCard, createCastCard, formatRuntime, formatDate } from './ui.js';
import { addContinueWatching, addToHistory } from './storage.js';
import { initHeader, initSearch } from './app.js';

initHeader();
initSearch();

const params = new URLSearchParams(location.search);
const id = params.get('id');

async function loadMovie() {
  const data = await fetchMovie(id);
  
  document.title = `${data.title} - StreamVault`;
  
  // Update OG
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.title);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', `${IMG_BASE}${data.backdrop_path}`);
  
  // Backdrop
  document.getElementById('detailBackdrop').style.backgroundImage = `url(${IMG_BASE}${data.backdrop_path})`;
  
  // Poster
  document.getElementById('detailPoster').innerHTML = `
    <img src="${IMG_W500}${data.poster_path}" alt="${data.title}">
  `;
  
  // Info
  document.getElementById('detailTitle').textContent = data.title;
  document.getElementById('detailMeta').innerHTML = `
    <span>${formatDate(data.release_date)}</span>
    <span>${formatRuntime(data.runtime)}</span>
    <span>★ ${data.vote_average?.toFixed(1)}</span>
  `;
  document.getElementById('detailTagline').textContent = data.tagline;
  document.getElementById('detailOverview').textContent = data.overview;
  
  // Genres
  const genresContainer = document.getElementById('detailGenres');
  data.genres?.forEach(g => {
    const tag = document.createElement('span');
    tag.className = 'genre-tag';
    tag.textContent = g.name;
    genresContainer.appendChild(tag);
  });
  
  // Watch Button
  const watchBtn = document.getElementById('watchBtn');
  watchBtn.href = `watch.html?id=${id}&type=movie&server=vidplus`;
  watchBtn.addEventListener('click', () => {
    addContinueWatching({
      id, type: 'movie', title: data.title,
      poster_path: data.poster_path,
      progress: 0
    });
    addToHistory({ id, type: 'movie', title: data.title, poster_path: data.poster_path });
  });
  
  // Trailer
  const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  if (trailer) {
    document.getElementById('trailerBtn').addEventListener('click', () => {
      const modal = document.getElementById('trailerModal');
      const container = document.getElementById('trailerContainer');
      container.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allowfullscreen></iframe>`;
      modal.classList.add('active');
    });
  } else {
    document.getElementById('trailerBtn').style.display = 'none';
  }
  
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('trailerModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'trailerModal') closeModal();
  });
  
  function closeModal() {
    document.getElementById('trailerModal').classList.remove('active');
    document.getElementById('trailerContainer').innerHTML = '';
  }
  
  // Cast
  const castRow = document.getElementById('castRow');
  data.credits?.cast?.slice(0, 10).forEach(p => {
    castRow.appendChild(createCastCard(p));
  });
  
  // Recommendations
  const recRow = document.getElementById('recommendationsRow');
  data.recommendations?.results?.slice(0, 10).forEach(m => {
    recRow.appendChild(createCard(m, 'movie'));
  });
}

loadMovie().catch(console.error);
