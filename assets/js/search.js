// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const Search = {
  currentQuery: '',
  isSearching: false,

  init() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (!searchInput || !searchSuggestions) return;

    searchInput.addEventListener('input', Utils.debounce(async (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        searchSuggestions.innerHTML = '';
        return;
      }
      await this.search(query, searchSuggestions);
    }, 400));

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  },

  async search(query, container) {
    if (this.isSearching) return;
    this.isSearching = true;

    try {
      const data = await API.searchAnime(query, { limit: 8, order_by: 'popularity' });
      this.renderSuggestions(data.data || [], container, query);
    } catch (error) {
      console.error('Search error:', error);
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Search failed. Please try again.</p>';
    } finally {
      this.isSearching = false;
    }
  },

  renderSuggestions(animes, container, query) {
    if (!animes.length) {
      container.innerHTML = `<p style="color:var(--muted);text-align:center;padding:1rem">No results for "${Utils.escapeHtml(query)}"</p>`;
      return;
    }

    container.innerHTML = animes.map(anime => `
      <a href="anime.html?id=${anime.mal_id}" class="suggestion-item">
        <img src="${anime.images?.jpg?.image_url || ''}" alt="" loading="lazy">
        <div class="suggestion-info">
          <h4>${Utils.escapeHtml(anime.title_english || anime.title)}</h4>
          <p>${anime.type || 'TV'} • ${anime.episodes || '?'} eps • ⭐ ${anime.score || 'N/A'}</p>
        </div>
      </a>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Search.init();
});
