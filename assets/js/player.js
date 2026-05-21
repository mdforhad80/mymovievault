const params = new URLSearchParams(location.search);
const id = params.get('id');
const type = params.get('type');
const season = params.get('season') || '1';
const episode = params.get('episode') || '1';
let currentServer = params.get('server') || 'vidplus';

const iframe = document.getElementById('video-player');
const loader = document.getElementById('playerLoader');
const metaEl = document.getElementById('watchMeta');
const episodeNav = document.getElementById('episodeNav');
const seasonSelect = document.getElementById('seasonSelect');
const episodeSelect = document.getElementById('episodeSelect');

export function generateMovieEmbed(tmdbId, server) {
  const servers = {
    vidstorm: `https://vidstorm.ru/movie/${tmdbId}`,
    vidrock: `https://vidrock.ru/movie/${tmdbId}`,
    vidplus: `https://player.vidplus.to/embed/movie/${tmdbId}`,
  };
  return servers[server];
}

export function generateTVEmbed(tmdbId, season, episode, server) {
  const servers = {
    vidstorm: `https://vidstorm.ru/tv/${tmdbId}/${season}/${episode}`,
    vidrock: `https://vidrock.ru/tv/${tmdbId}/${season}/${episode}`,
    vidplus: `https://player.vidplus.to/embed/tv/${tmdbId}/${season}/${episode}`,
  };
  return servers[server];
}

function loadPlayer() {
  loader.classList.remove('hidden');
  
  if (type === 'movie') {
    iframe.src = generateMovieEmbed(id, currentServer);
    metaEl.textContent = 'Movie';
    episodeNav.style.display = 'none';
  } else if (type === 'tv') {
    iframe.src = generateTVEmbed(id, season, episode, currentServer);
    metaEl.textContent = `S${season} E${episode}`;
    episodeNav.style.display = 'flex';
    loadEpisodeSelectors();
  }
  
  iframe.onload = () => {
    setTimeout(() => loader.classList.add('hidden'), 800);
  };
}

async function loadEpisodeSelectors() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=e10da2e2cbb23ea7ebfb64c3a188b64a`);
    const data = await res.json();
    
    seasonSelect.innerHTML = '';
    data.seasons.forEach(s => {
      if (s.season_number === 0) return;
      const opt = document.createElement('option');
      opt.value = s.season_number;
      opt.textContent = `Season ${s.season_number}`;
      if (s.season_number == season) opt.selected = true;
      seasonSelect.appendChild(opt);
    });
    
    await loadEpisodes(season);
    
    seasonSelect.addEventListener('change', (e) => {
      loadEpisodes(e.target.value);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadEpisodes(seasonNum) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?api_key=e10da2e2cbb23ea7ebfb64c3a188b64a`
    );
    const data = await res.json();
    
    episodeSelect.innerHTML = '';
    data.episodes.forEach(ep => {
      const opt = document.createElement('option');
      opt.value = ep.episode_number;
      opt.textContent = `E${ep.episode_number}: ${ep.name}`;
      if (ep.episode_number == episode) opt.selected = true;
      episodeSelect.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
  }
}

// Server switching
document.querySelectorAll('.server-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentServer = btn.dataset.server;
    loadPlayer();
  });
});

// Navigation
document.getElementById('prevEpisode')?.addEventListener('click', () => {
  const ep = parseInt(episodeSelect.value);
  if (ep > 1) {
    episodeSelect.value = ep - 1;
    navigateToEpisode();
  }
});

document.getElementById('nextEpisode')?.addEventListener('click', () => {
  const ep = parseInt(episodeSelect.value);
  const max = episodeSelect.options.length;
  if (ep < max) {
    episodeSelect.value = ep + 1;
    navigateToEpisode();
  }
});

episodeSelect?.addEventListener('change', navigateToEpisode);

function navigateToEpisode() {
  const s = seasonSelect.value;
  const e = episodeSelect.value;
  window.location.href = `watch.html?id=${id}&type=tv&season=${s}&episode=${e}&server=${currentServer}`;
}

// Theater mode
document.getElementById('theaterToggle')?.addEventListener('click', () => {
  document.body.classList.toggle('theater-mode');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    iframe.requestFullscreen?.();
  }
  if (e.key === 'ArrowRight') {
    document.getElementById('nextEpisode')?.click();
  }
  if (e.key === 'ArrowLeft') {
    document.getElementById('prevEpisode')?.click();
  }
});

loadPlayer();
