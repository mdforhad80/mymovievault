import { IMG_W500 } from './tmdb.js';

export function createCard(item, type) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const id = item.id;
  const mediaType = type || item.media_type;
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const poster = item.poster_path ? `${IMG_W500}${item.poster_path}` : 'assets/images/placeholder.jpg';
  
  card.innerHTML = `
    <img class="card-image" src="${poster}" alt="${title}" loading="lazy">
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-meta">
        <span class="rating">★ ${rating}</span>
        <span>${date ? date.split('-')[0] : 'N/A'}</span>
      </div>
    </div>
  `;
  
  card.addEventListener('click', () => {
    if (mediaType === 'movie') {
      window.location.href = `movie.html?id=${id}`;
    } else {
      window.location.href = `show.html?id=${id}`;
    }
  });
  
  return card;
}

export function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'card skeleton';
  card.style.width = '200px';
  card.style.height = '300px';
  return card;
}

export function createCastCard(person) {
  const card = document.createElement('div');
  card.className = 'cast-card';
  const img = person.profile_path 
    ? `${IMG_W500}${person.profile_path}` 
    : 'assets/images/avatar.jpg';
  
  card.innerHTML = `
    <img src="${img}" alt="${person.name}" loading="lazy">
    <div class="cast-name">${person.name}</div>
    <div class="cast-character">${person.character || person.job || ''}</div>
  `;
  return card;
}

export function showSkeletons(container, count = 6) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.appendChild(createSkeletonCard());
  }
}

export function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
