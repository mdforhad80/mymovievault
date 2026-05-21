// movie.js – Detail page logic
async function loadMovieDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie'; // default to movie
  
  if (!id) {
    document.getElementById('detail-content').innerHTML = '<p>No ID provided.</p>';
    return;
  }

  try {
    let details, recommendations;
    if (type === 'tv') {
      details = await getTVDetails(id);
      recommendations = await getTVRecommendations(id);
    } else {
      details = await getMovieDetails(id);
      recommendations = await getMovieRecommendations(id);
    }

    renderDetailPage(details, type, recommendations.results);
  } catch (err) {
    console.error(err);
    document.getElementById('detail-content').innerHTML = '<p>Error loading details.</p>';
  }
}

function renderDetailPage(data, type, recs) {
  const container = document.getElementById('detail-content');
  const backdrop = data.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` 
    : '';
  const poster = data.poster_path 
    ? `https://image.tmdb.org/t/p/w300${data.poster_path}` 
    : '';
  const title = type === 'tv' ? data.name : data.title;
  const originalTitle = data.original_name || data.original_title || '';
  const genres = data.genres?.map(g => g.name).join(', ') || 'N/A';
  const status = data.status || 'Unknown';
  const episodes = type === 'tv' ? data.number_of_episodes : 'N/A';
  const seasons = type === 'tv' ? data.number_of_seasons : 'N/A';
  const runtime = type === 'tv' 
    ? (data.episode_run_time?.length ? data.episode_run_time[0] + 'm' : 'N/A') 
    : (data.runtime ? data.runtime + 'm' : 'N/A');
  const date = type === 'tv' ? data.first_air_date : data.release_date;
  const country = data.production_countries?.map(c => c.name).join(', ') || 'N/A';
  const vote = data.vote_average?.toFixed(1) || 'N/A';

  container.innerHTML = `
    <div class="detail-backdrop" style="background-image: url(${backdrop})"></div>
    <div class="detail-main glass-card">
      <img src="${poster}" class="detail-poster" alt="${title}">
      <div class="detail-info">
        <h1>${title}</h1>
        <p class="original-title">${originalTitle}</p>
        <div class="detail-meta">
          <span class="badge">${type.toUpperCase()}</span>
          <span>⭐ ${vote}</span>
          <span>${runtime}</span>
          ${type === 'tv' ? `<span>${seasons} Seasons</span>` : ''}
        </div>
        <p class="synopsis">${data.overview || 'No overview available.'}</p>
        <div class="detail-stats">
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Genres:</strong> ${genres}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Release Date:</strong> ${date || 'Unknown'}</p>
          ${type === 'tv' ? `<p><strong>Episodes:</strong> ${episodes}</p>` : ''}
        </div>
        <a href="https://www.themoviedb.org/${type}/${data.id}" target="_blank" class="btn outline">TMDB Page</a>
        ${type === 'tv' 
          ? `<button class="btn primary" onclick="loadSeasons(${data.id})">View Seasons & Episodes</button>`
          : `<a href="watch.html?id=${data.id}&type=movie" class="btn primary">▶ Watch Movie</a>`
        }
      </div>
    </div>
    <div class="seasons-container" id="seasons-container"></div>
    <h2 style="margin-top: 2rem;">Recommended</h2>
    <div class="grid" id="recs-grid">${recs.map(r => createCard(r, r.media_type || (r.title ? 'movie' : 'tv'))).join('')}</div>
  `;
}

// For TV: load season selector
async function loadSeasons(tvId) {
  const container = document.getElementById('seasons-container');
  const details = await getTVDetails(tvId);
  const seasons = details.seasons.filter(s => s.season_number > 0);
  container.innerHTML = seasons.map(s => `
    <button class="season-btn" onclick="loadEpisodes(${tvId}, ${s.season_number})">${s.name} (${s.episode_count} eps)</button>
  `).join('');
}

async function loadEpisodes(tvId, seasonNum) {
  const seasonData = await getTVSeason(tvId, seasonNum);
  const episodes = seasonData.episodes;
  const epList = document.getElementById('seasons-container');
  epList.innerHTML = `<h3>Season ${seasonNum}</h3>` + episodes.map(ep => `
    <div class="episode-row">
      <span>E${ep.episode_number} - ${ep.name}</span>
      <a href="watch.html?id=${tvId}&type=tv&s=${seasonNum}&e=${ep.episode_number}" class="btn small">▶ Watch</a>
    </div>
  `).join('');
}
