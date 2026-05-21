// app.js – Initializes site-wide features, runs on each page
document.addEventListener('DOMContentLoaded', () => {
  // Particles background (only on home page or all pages? I'll add to all)
  initParticles();

  // Initialize search overlay (present on pages with header)
  if (document.querySelector('.search-btn')) {
    initSearchOverlay();
  }

  // Mobile menu toggle (placeholder)
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      alert('Menu not yet implemented (can be a slide-out drawer)');
    });
  }

  // Page-specific init
  if (document.getElementById('hero-slides')) {
    // Home page - load hero + widgets
    loadHomePage();
  } else if (document.getElementById('detail-content')) {
    // Movie detail
    loadMovieDetails();
  } else if (document.getElementById('player-area')) {
    // Watch page
    loadWatchPage();
  } else if (document.getElementById('schedule-content')) {
    loadSchedule();
  }
});

async function loadHomePage() {
  // Fetch data for widgets
  try {
    const trending = await getTrendingMovies('week');
    initHeroSlider(trending.results.slice(0, 5));

    const popular = await getPopularMovies();
    renderCards('popular-grid', popular.results, 'movie');

    const upcoming = await getUpcomingMovies();
    renderCards('upcoming-grid', upcoming.results, 'movie');

    const topTV = await getPopularTV();
    renderCards('tv-grid', topTV.results, 'tv');

    // Continue watching from localStorage
    renderContinueWatching();
  } catch (err) {
    console.error('Home page load error:', err);
  }
}

function renderContinueWatching() {
  const grid = document.getElementById('continue-grid');
  const items = getContinueWatching();
  if (items.length === 0) {
    grid.innerHTML = '<p>No continue watching items yet.</p>';
    return;
  }
  grid.innerHTML = items.slice(0, 6).map(item => {
    return `
      <div class="card glass-card continue-card">
        <img src="${item.poster}" onerror="this.src='data:image/svg+xml,...'">
        <div class="card-body">
          <h4>${item.title}</h4>
          <small>${item.type === 'tv' ? `S${item.season}E${item.episode}` : 'Movie'}</small>
          <a href="watch.html?id=${item.id}&type=${item.type}${item.season ? '&s='+item.season+'&e='+item.episode : ''}" class="btn small">Resume</a>
        </div>
      </div>
    `;
  }).join('');
}
