// search.js – Search overlay and page logic

let searchTimeout;
function initSearchOverlay() {
  const searchBtn = document.querySelector('.search-btn');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  if (!searchBtn || !overlay) return;

  searchBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    input.focus();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
      results.innerHTML = '';
      return;
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      results.innerHTML = '<div class="spinner"></div>';
      try {
        const data = await searchMulti(query, 1);
        if (data.results.length) {
          results.innerHTML = data.results.slice(0, 8).map(item => {
            const poster = item.poster_path 
              ? `https://image.tmdb.org/t/p/w92${item.poster_path}` 
              : '';
            const title = item.title || item.name;
            const type = item.media_type === 'tv' ? 'tv' : 'movie';
            return `<a href="movie.html?id=${item.id}&type=${type}" class="search-item">
              <img src="${poster}">
              <div>
                <strong>${title}</strong>
                <small>${type}</small>
              </div>
            </a>`;
          }).join('');
        } else {
          results.innerHTML = '<p>No results.</p>';
        }
      } catch {
        results.innerHTML = '<p>Error.</p>';
      }
    }, 400);
  });
}

// Dedicated search page (search.html) will use similar logic but with infinite scroll
