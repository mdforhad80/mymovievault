// player.js – Watch page logic
const SERVERS = ['vidstorm', 'vidrock', 'vidplus'];

function getEmbedUrl(server, tmdbId, type, season, episode) {
  const urls = {
    vidstorm: type === 'movie' 
      ? `https://vidstorm.ru/movie/${tmdbId}` 
      : `https://vidstorm.ru/tv/${tmdbId}/${season}/${episode}`,
    vidrock: type === 'movie' 
      ? `https://vidrock.ru/movie/${tmdbId}` 
      : `https://vidrock.ru/tv/${tmdbId}/${season}/${episode}`,
    vidplus: type === 'movie' 
      ? `https://player.vidplus.to/embed/movie/${tmdbId}` 
      : `https://player.vidplus.to/embed/tv/${tmdbId}/${season}/${episode}`
  };
  return urls[server];
}

function loadWatchPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';
  const season = params.get('s');
  const episode = params.get('e');

  if (!id) {
    document.getElementById('player-area').innerHTML = '<p>No ID provided.</p>';
    return;
  }

  // Default server from settings or first
  const activeServer = getSetting('activeServer', 'vidstorm');
  const embedUrl = type === 'movie' 
    ? getEmbedUrl(activeServer, id, type)
    : getEmbedUrl(activeServer, id, type, season, episode);

  document.getElementById('video-iframe').src = embedUrl;

  // Build server selector
  const serverSelect = document.getElementById('server-select');
  serverSelect.innerHTML = SERVERS.map(s => 
    `<option value="${s}" ${s === activeServer ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
  ).join('');
  serverSelect.onchange = (e) => {
    setSetting('activeServer', e.target.value);
    document.getElementById('video-iframe').src = getEmbedUrl(e.target.value, id, type, season, episode);
  };

  // Auto next episode logic (for TV)
  if (type === 'tv' && season && episode) {
    const nextBtn = document.getElementById('next-episode-btn');
    nextBtn.style.display = 'block';
    nextBtn.onclick = async () => {
      const nextEpNum = parseInt(episode) + 1;
      // Fetch season to check if next exists
      const seasonData = await getTVSeason(id, season);
      if (nextEpNum <= seasonData.episodes.length) {
        window.location.href = `watch.html?id=${id}&type=tv&s=${season}&e=${nextEpNum}`;
      } else {
        // Try next season
        const tvDetails = await getTVDetails(id);
        const nextSeason = parseInt(season) + 1;
        if (nextSeason <= tvDetails.number_of_seasons) {
          window.location.href = `watch.html?id=${id}&type=tv&s=${nextSeason}&e=1`;
        } else {
          alert('No more episodes.');
        }
      }
    };
  }

  // Save continue watching
  const title = document.getElementById('movie-title')?.textContent || 'Loading...';
  const poster = document.querySelector('.watch-poster img')?.src || '';
  updateContinueWatching({
    id, type, season: season || null, episode: episode || null,
    title, poster, progress: 0, lastWatched: Date.now()
  });
  addToHistory({ id, type, title, poster, watchedAt: Date.now() });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (document.fullscreenElement || document.querySelector('.watch-page')) {
    const iframe = document.getElementById('video-iframe');
    switch(e.key) {
      case 'f': iframe.requestFullscreen(); break;
      case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
    }
  }
});
