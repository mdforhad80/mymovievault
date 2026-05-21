// ============================================
// SEARCH PAGE
// ============================================

const SearchPage = {
  currentPage: 1,
  currentQuery: '',
  currentFilters: {},
  isLoading: false,
  hasMore: true,

  async init() {
    // Parse URL params
    const url = new URL(window.location.href);
    this.currentQuery = url.searchParams.get('q') || '';
    this.currentFilters = {
      genre: url.searchParams.get('genre') || '',
      type: url.searchParams.get('type') || '',
      status: url.searchParams.get('status') || '',
      season: url.searchParams.get('season') || '',
      year: url.searchParams.get('year') || ''
    };

    // Setup filters
    this.setupFilters();
    this.setupYearFilter();
    this.setupGenreFilter();

    // Load initial results
    await this.loadResults();
    this.setupInfiniteScroll();
    hideLoadingScreen();
  },

  setupFilters() {
    const filters = {
      genreFilter: 'genre',
      typeFilter: 'type',
      statusFilter: 'status',
      seasonFilter: 'season',
      yearFilter: 'year'
    };

    Object.entries(filters).forEach(([elementId, param]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.value = this.currentFilters[param] || '';
        element.addEventListener('change', () => {
          this.currentFilters[param] = element.value;
          this.currentPage = 1;
          this.hasMore = true;
          this.loadResults(true);
        });
      }
    });
  },

  setupYearFilter() {
    const yearFilter = document.getElementById('yearFilter');
    if (!yearFilter) return;

    const years = Utils.generateYears(1980);
    yearFilter.innerHTML = '<option value="">All Years</option>' +
      years.map(y => `<option value="${y}">${y}</option>`).join('');
    yearFilter.value = this.currentFilters.year || '';
  },

  async setupGenreFilter() {
    const genreFilter = document.getElementById('genreFilter');
    if (!genreFilter) return;

    try {
      const data = await API.getGenres();
      const genres = data.data || [];
      genreFilter.innerHTML = '<option value="">All Genres</option>' +
        genres.map(g => `<option value="${g.mal_id}">${g.name}</option>`).join('');
      genreFilter.value = this.currentFilters.genre || '';
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  },

  async loadResults(reset = false) {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;

    const container = document.getElementById('searchResults');
    const loadingEl = document.getElementById('searchLoading');

    if (reset) {
      container.innerHTML = UI.createSkeletonCards(12);
      this.currentPage = 1;
    }

    if (loadingEl) loadingEl.style.display = 'block';

    try {
      const params = {
        page: this.currentPage,
        limit: 24,
        ...this.currentFilters
      };

      if (this.currentQuery) {
        params.q = this.currentQuery;
      }

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const data = await API.searchAnime(this.currentQuery, params);
      const animes = data.data || [];
      const pagination = data.pagination || {};

      this.hasMore = pagination.has_next_page || false;

      if (reset) {
        container.innerHTML = '';
      }

      if (animes.length === 0 && this.currentPage === 1) {
        container.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)">
            <h3 style="font-size:1.5rem;margin-bottom:1rem">No results found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        `;
      } else {
        const html = animes.map(anime => UI.createAnimeCard(anime)).join('');
        if (reset) {
          container.innerHTML = html;
        } else {
          container.insertAdjacentHTML('beforeend', html);
        }
        UI.attachCardListeners(container);
      }

      this.currentPage++;
    } catch (error) {
      console.error('Search error:', error);
      if (this.currentPage === 1) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">Failed to load results. Please try again.</p>';
      }
    } finally {
      this.isLoading = false;
      if (loadingEl) loadingEl.style.display = 'none';
    }
  },

  setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMore) {
          this.loadResults();
        }
      });
    }, { rootMargin: '200px' });

    const loadingEl = document.getElementById('searchLoading');
    if (loadingEl) observer.observe(loadingEl);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SearchPage.init();
});
