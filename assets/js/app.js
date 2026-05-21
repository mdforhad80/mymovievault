// ============================================
// HOME PAGE APP
// ============================================

const App = {
  heroInterval: null,
  currentHeroSlide: 0,
  heroAnimes: [],

  async init() {
    hideLoadingScreen();

    // Load all sections in parallel where possible
    this.loadHero();
    this.loadContinueWatching();
    this.loadWatchHistory();
    this.loadTrending();
    this.loadPopular();
    this.loadTopAiring();
    this.loadPopularMovies();
    this.loadWidgets();
    this.loadRecommended();
    this.loadGenreHighlights();

    // Setup clear history button
    const clearBtn = document.getElementById('clearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Storage.clearHistory();
        this.loadWatchHistory();
        UI.showToast('Watch history cleared', 'success');
      });
    }

    // Setup random anime button
    const randomBtn = document.getElementById('randomAnimeBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => this.loadRandomAnime());
    }

    // Setup carousel buttons
    this.setupCarousels();
  },

  async loadHero() {
    const container = document.getElementById('heroSlides');
    const dotsContainer = document.getElementById('heroDots');
    if (!container || !dotsContainer) return;

    try {
      // Fetch top anime for hero
      const data = await API.getTopAnime('', 1, 5);
      this.heroAnimes = data.data || [];

      if (this.heroAnimes.length === 0) {
        container.innerHTML = '<div class="hero-slide active"><div class="hero-bg" style="background:var(--gradient-primary)"></div></div>';
        return;
      }

      container.innerHTML = this.heroAnimes.map((anime, index) => {
        const title = anime.title_english || anime.title;
        const bg = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
        const synopsis = Utils.truncate(anime.synopsis, 200);
        const score = anime.score || 'N/A';
        const episodes = anime.episodes || '?';
        const type = anime.type || 'TV';
        const status = anime.status || '';

        return `
          <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="hero-bg" style="background-image:url('${bg}')"></div>
            <div class="hero-content">
              ${status === 'Currently Airing' ? '<div class="hero-badge">🔥 Trending Now</div>' : ''}
              <h1 class="hero-title">${Utils.escapeHtml(title)}</h1>
              <div class="hero-meta">
                <span class="rating">⭐ ${score}</span>
                <span>${type}</span>
                <span>${episodes} Episodes</span>
              </div>
              <p class="hero-desc">${Utils.escapeHtml(synopsis)}</p>
              <div class="hero-buttons">
                <a href="watch.html?id=${anime.mal_id}&ep=1&type=sub" class="btn btn-primary">
                  <span>▶</span> Watch Now
                </a>
                <a href="anime.html?id=${anime.mal_id}" class="btn btn-secondary">
                  <span>ℹ️</span> More Info
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');

      dotsContainer.innerHTML = this.heroAnimes.map((_, index) => `
        <button class="hero-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>
      `).join('');

      // Attach dot listeners
      dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', () => this.goToHeroSlide(parseInt(dot.dataset.index)));
      });

      // Start auto-slide
      this.startHeroAutoSlide();
    } catch (error) {
      console.error('Hero load error:', error);
    }
  },

  goToHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');

    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    this.currentHeroSlide = index;
  },

  startHeroAutoSlide() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    this.heroInterval = setInterval(() => {
      const next = (this.currentHeroSlide + 1) % this.heroAnimes.length;
      this.goToHeroSlide(next);
    }, 6000);
  },

  async loadContinueWatching() {
    const container = document.getElementById('continueContainer');
    if (!container) return;

    const items = Storage.getContinueWatching();
    if (items.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);padding:1rem;min-width:200px">No continue watching items.</p>';
      return;
    }

    // Fetch anime details for each item
    const animes = [];
    for (const item of items.slice(0, 10)) {
      try {
        const data = await API.getAnime(item.animeId);
        if (data.data) {
          animes.push({
            ...data.data,
            _episode: item.episode,
            _progress: item.progress,
            _type: item.type
          });
        }
      } catch (e) {
        console.warn('Failed to load continue watching item:', item.animeId);
      }
    }

    container.innerHTML = animes.map(anime => {
      const progress = anime._progress || 0;
      const episode = anime._episode || 1;
      return UI.createAnimeCard(anime, {
        showEpisode: true,
        episodeNum: episode,
        progress: progress,
        className: 'continue-card'
      });
    }).join('');

    // Add click listeners for continue watching
    container.querySelectorAll('.anime-card').forEach((card, index) => {
      const item = items[index];
      if (item) {
        card.addEventListener('click', () => {
          window.location.href = `watch.html?id=${item.animeId}&ep=${item.episode}&type=${item.type}`;
        });
      }
    });
  },

  async loadWatchHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) return;

    const history = Storage.getHistory();
    if (history.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);padding:1rem;min-width:200px">No watch history.</p>';
      return;
    }

    // Fetch anime details
    const animes = [];
    for (const item of history.slice(0, 15)) {
      try {
        const data = await API.getAnime(item.animeId);
        if (data.data) {
          animes.push({ ...data.data, _episode: item.episode, _type: item.type });
        }
      } catch (e) {
        // Skip failed items
      }
    }

    container.innerHTML = animes.map(anime => 
      UI.createAnimeCard(anime, { showEpisode: true, episodeNum: anime._episode })
    ).join('');

    UI.attachCardListeners(container);
  },

  async loadTrending() {
    const container = document.getElementById('trendingGrid');
    if (!container) return;
    container.innerHTML = UI.createSkeletonCards(6);

    try {
      const data = await API.getTopAnime('airing', 1, 12);
      UI.renderAnimeGrid(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load trending anime.</p>';
    }
  },

  async loadPopular() {
    const container = document.getElementById('popularGrid');
    if (!container) return;
    container.innerHTML = UI.createSkeletonCards(6);

    try {
      const data = await API.getTopAnime('bypopularity', 1, 12);
      UI.renderAnimeGrid(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load popular anime.</p>';
    }
  },

  async loadTopAiring() {
    const container = document.getElementById('airingGrid');
    if (!container) return;
    container.innerHTML = UI.createSkeletonCards(6);

    try {
      const data = await API.searchAnime('', { status: 'airing', order_by: 'members', limit: 12 });
      UI.renderAnimeGrid(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load airing anime.</p>';
    }
  },

  async loadPopularMovies() {
    const container = document.getElementById('moviesGrid');
    if (!container) return;
    container.innerHTML = UI.createSkeletonCards(6);

    try {
      const data = await API.searchAnime('', { type: 'movie', order_by: 'members', limit: 12 });
      UI.renderAnimeGrid(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load movies.</p>';
    }
  },

  async loadWidgets() {
    await Promise.all([
      this.loadLatestUpdates(),
      this.loadNewReleases(),
      this.loadUpcomingWidget(),
      this.loadCompletedWidget()
    ]);
  },

  async loadLatestUpdates() {
    const container = document.getElementById('latestUpdates');
    if (!container) return;

    try {
      const data = await API.getTopAnime('airing', 1, 6);
      UI.renderWidgetList(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">No updates available.</p>';
    }
  },

  async loadNewReleases() {
    const container = document.getElementById('newReleases');
    if (!container) return;

    try {
      const season = Utils.getCurrentSeason();
      const year = Utils.getCurrentYear();
      const data = await API.getSeasonal(season, year, 1, 6);
      UI.renderWidgetList(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">No new releases.</p>';
    }
  },

  async loadUpcomingWidget() {
    const container = document.getElementById('upcomingWidget');
    if (!container) return;

    try {
      const data = await API.getUpcoming(1, 6);
      UI.renderWidgetList(container, data.data || [], { showCountdown: true, countdown: 'Coming Soon' });
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">No upcoming anime.</p>';
    }
  },

  async loadCompletedWidget() {
    const container = document.getElementById('completedWidget');
    if (!container) return;

    try {
      const data = await API.searchAnime('', { status: 'complete', order_by: 'members', limit: 6 });
      UI.renderWidgetList(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">No completed anime.</p>';
    }
  },

  async loadRecommended() {
    const container = document.getElementById('recommendedGrid');
    if (!container) return;
    container.innerHTML = UI.createSkeletonCards(6);

    try {
      // Get random selection from featured IDs
      const shuffled = Utils.shuffle(FEATURED_ANIME_IDS).slice(0, 12);
      const animes = [];

      for (const id of shuffled) {
        try {
          const data = await API.getAnime(id);
          if (data.data) animes.push(data.data);
        } catch (e) {
          // Skip
        }
        if (animes.length >= 6) break;
      }

      UI.renderAnimeGrid(container, animes);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load recommendations.</p>';
    }
  },

  async loadRandomAnime() {
    const container = document.getElementById('recommendedGrid');
    if (!container) return;
    container.innerHTML = UI.createSkeletonCards(6);

    try {
      const animes = [];
      for (let i = 0; i < 6; i++) {
        try {
          const data = await API.getRandomAnime();
          if (data.data) animes.push(data.data);
        } catch (e) {
          // Skip
        }
      }
      UI.renderAnimeGrid(container, animes);
      UI.showToast('Random anime loaded!', 'success');
    } catch (error) {
      UI.showToast('Failed to load random anime', 'error');
    }
  },

  async loadGenreHighlights() {
    const genreList = document.getElementById('genreList');
    const grid = document.getElementById('genreAnimeGrid');
    if (!genreList || !grid) return;

    // Create genre buttons
    const genres = [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' },
      { id: 4, name: 'Comedy' },
      { id: 8, name: 'Drama' },
      { id: 10, name: 'Fantasy' },
      { id: 22, name: 'Romance' },
      { id: 24, name: 'Sci-Fi' },
      { id: 36, name: 'Slice of Life' }
    ];

    let activeGenre = genres[0].id;

    genreList.innerHTML = genres.map(g => `
      <a href="#" class="genre-tag ${g.id === activeGenre ? 'active' : ''}" data-id="${g.id}">${g.name}</a>
    `).join('');

    // Load initial genre anime
    await this.loadGenreAnime(activeGenre, grid);

    // Attach listeners
    genreList.querySelectorAll('.genre-tag').forEach(tag => {
      tag.addEventListener('click', async (e) => {
        e.preventDefault();
        genreList.querySelectorAll('.genre-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        await this.loadGenreAnime(parseInt(tag.dataset.id), grid);
      });
    });
  },

  async loadGenreAnime(genreId, container) {
    container.innerHTML = UI.createSkeletonCards(6);
    try {
      const data = await API.getAnimeByGenre(genreId, 1, 12);
      UI.renderAnimeGrid(container, data.data || []);
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load genre anime.</p>';
    }
  },

  setupCarousels() {
    const setupScroll = (prevId, nextId, containerId) => {
      const prev = document.getElementById(prevId);
      const next = document.getElementById(nextId);
      const container = document.getElementById(containerId);
      if (!prev || !next || !container) return;

      prev.addEventListener('click', () => {
        container.scrollBy({ left: -300, behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        container.scrollBy({ left: 300, behavior: 'smooth' });
      });
    };

    setupScroll('continuePrev', 'continueNext', 'continueContainer');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
