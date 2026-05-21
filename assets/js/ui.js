// ============================================
// UI COMPONENTS
// ============================================

const UI = {
  // Create anime card HTML
  createAnimeCard(anime, options = {}) {
    const {
      showEpisode = false,
      episodeNum = null,
      progress = 0,
      large = false,
      className = ''
    } = options;

    const id = anime.mal_id || anime.id;
    const title = anime.title_english || anime.title || 'Unknown';
    const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image_url || '';
    const score = anime.score || anime.rating || 'N/A';
    const type = anime.type || 'TV';
    const episodes = anime.episodes || '?';
    const status = anime.status || 'Unknown';

    let badge = '';
    if (showEpisode && episodeNum) {
      badge = `<div class="anime-card-badge episode">EP ${episodeNum}</div>`;
    } else if (status === 'Currently Airing') {
      badge = `<div class="anime-card-badge">AIRING</div>`;
    }

    const progressBar = progress > 0 
      ? `<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.1);z-index:4"><div style="width:${progress}%;height:100%;background:var(--purple)"></div></div>`
      : '';

    return `
      <article class="anime-card ${className} ${large ? 'large' : ''}" data-id="${id}">
        <div class="anime-card-poster">
          <img src="${poster}" alt="${Utils.escapeHtml(title)}" loading="lazy">
          ${badge}
          <div class="anime-card-rating">⭐ ${score}</div>
          <div class="anime-card-overlay">
            <div class="anime-card-play">▶</div>
          </div>
          ${progressBar}
        </div>
        <div class="anime-card-info">
          <h3 class="anime-card-title">${Utils.escapeHtml(title)}</h3>
          <div class="anime-card-meta">
            <span>${type}</span>
            <span>•</span>
            <span>${episodes} EPS</span>
          </div>
        </div>
      </article>
    `;
  },

  // Create widget item HTML
  createWidgetItem(anime, options = {}) {
    const { showCountdown = false, countdown = '' } = options;
    const id = anime.mal_id || anime.id;
    const title = anime.title_english || anime.title || 'Unknown';
    const poster = anime.images?.jpg?.image_url || anime.image_url || '';
    const type = anime.type || 'TV';
    const score = anime.score || 'N/A';

    return `
      <a href="anime.html?id=${id}" class="widget-item">
        <img src="${poster}" alt="${Utils.escapeHtml(title)}" loading="lazy">
        <div class="widget-item-info">
          <div class="widget-item-title">${Utils.escapeHtml(title)}</div>
          <div class="widget-item-meta">${type} • ⭐ ${score}</div>
        </div>
        ${showCountdown ? `<div class="widget-item-countdown">${countdown}</div>` : ''}
      </a>
    `;
  },

  // Create skeleton cards
  createSkeletonCards(count = 6) {
    return Array(count).fill(0).map(() => `
      <div class="anime-card">
        <div class="anime-card-poster skeleton skeleton-card"></div>
        <div class="anime-card-info">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>
    `).join('');
  },

  // Render anime grid
  renderAnimeGrid(container, animes, options = {}) {
    if (!container) return;
    if (!animes || animes.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">No anime found.</p>';
      return;
    }
    container.innerHTML = animes.map(anime => this.createAnimeCard(anime, options)).join('');
    this.attachCardListeners(container);
  },

  // Render widget list
  renderWidgetList(container, animes, options = {}) {
    if (!container) return;
    if (!animes || animes.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:1rem">No items.</p>';
      return;
    }
    container.innerHTML = animes.map(anime => this.createWidgetItem(anime, options)).join('');
  },

  // Attach click listeners to cards
  attachCardListeners(container) {
    container.querySelectorAll('.anime-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.id;
        if (id) {
          window.location.href = `anime.html?id=${id}`;
        }
      });
    });
  },

  // Show toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${Utils.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Toggle sidebar
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
  },

  // Toggle search overlay
  toggleSearch(show) {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (overlay) {
      overlay.classList.toggle('open', show);
      document.body.style.overflow = show ? 'hidden' : '';
      if (show && input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  },

  // Initialize common UI
  initCommon() {
    // Menu button
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Sidebar overlay
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => this.toggleSidebar());
    }

    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.toggleSearch(true));
    }

    // Search close
    const searchClose = document.getElementById('searchClose');
    if (searchClose) {
      searchClose.addEventListener('click', () => this.toggleSearch(false));
    }

    // Close search on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleSearch(false);
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          this.toggleSidebar();
        }
      }
    });

    // Mobile nav active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mobile-nav a').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UI.initCommon();
});
