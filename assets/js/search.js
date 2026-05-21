import { searchMulti, searchMovies, searchTV, IMG_W500 } from './tmdb.js';
import { createCard } from './ui.js';
import { initHeader } from './app.js';

initHeader();

const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
const filters = document.querySelectorAll('.filter-btn');
const loadingTrigger = document.getElementById('loadingTrigger');

let query = new URLSearchParams(location.search).get('q') || '';
let currentType = 'all';
let currentPage = 1;
let isLoading = false;
let hasMore = true;

if (query) {
  input.value = query;
  performSearch();
}

input.addEventListener('input', (e) => {
  query = e.target.value;
  currentPage = 1;
  hasMore = true;
  results.innerHTML = '';
  if (query.length > 2) performSearch();
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    currentPage = 1;
    hasMore = true;
    results.innerHTML = '';
    if (query.length > 2) performSearch();
  });
});

async function performSearch() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  loadingTrigger.style.display = 'block';
  
  try {
    let data;
    if (currentType === 'movie') {
      data = await searchMovies(query, currentPage);
    } else if (currentType === 'tv') {
      data = await searchTV(query, currentPage);
    } else {
      data = await searchMulti(query, currentPage);
    }
    
    const items = data.results.filter(item => {
      if (currentType === 'all') return item.media_type === 'movie' || item.media_type === 'tv';
      return true;
    });
    
    if (items.length === 0 && currentPage === 1) {
      results.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:3rem">No results found.</p>';
    }
    
    items.forEach(item => {
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      results.appendChild(createCard(item, type));
    });
    
    if (data.page >= data.total_pages) hasMore = false;
    currentPage++;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading = false;
    if (!hasMore) loadingTrigger.style.display = 'none';
  }
}

// Infinite scroll
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !isLoading && hasMore && query.length > 2) {
    performSearch();
  }
});
observer.observe(loadingTrigger);
