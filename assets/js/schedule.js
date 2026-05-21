// ============================================
// SCHEDULE PAGE
// ============================================

const SchedulePage = {
  currentDay: 'monday',
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'other'],

  async init() {
    // Set active tab based on current day
    const today = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    this.currentDay = dayMap[today] || 'monday';

    this.setupTabs();
    await this.loadSchedule(this.currentDay);
    hideLoadingScreen();
  },

  setupTabs() {
    const tabs = document.getElementById('scheduleTabs');
    if (!tabs) return;

    tabs.querySelectorAll('.schedule-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        tabs.querySelectorAll('.schedule-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentDay = tab.dataset.day;
        await this.loadSchedule(this.currentDay);
      });
    });

    // Set initial active tab
    tabs.querySelectorAll('.schedule-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.day === this.currentDay);
    });
  },

  async loadSchedule(day) {
    const container = document.getElementById('scheduleGrid');
    const loadingEl = document.getElementById('scheduleLoading');
    if (!container) return;

    container.innerHTML = UI.createSkeletonCards(12);
    if (loadingEl) loadingEl.style.display = 'block';

    try {
      const data = await API.getSchedule(day);
      const animes = data.data || [];

      if (animes.length === 0) {
        container.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)">
            <h3 style="font-size:1.5rem;margin-bottom:1rem">No anime scheduled for ${Utils.capitalize(day)}</h3>
            <p>Check back later for updates.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = animes.map(anime => {
        const title = anime.title_english || anime.title;
        const poster = anime.images?.jpg?.image_url || '';
        const score = anime.score || 'N/A';
        const type = anime.type || 'TV';
        const time = anime.broadcast?.time || 'TBA';
        const episodes = anime.episodes || '?';

        return `
          <article class="anime-card" data-id="${anime.mal_id}">
            <div class="anime-card-poster">
              <img src="${poster}" alt="${Utils.escapeHtml(title)}" loading="lazy">
              <div class="anime-card-badge">${time}</div>
              <div class="anime-card-rating">⭐ ${score}</div>
              <div class="anime-card-overlay">
                <div class="anime-card-play">▶</div>
              </div>
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
      }).join('');

      UI.attachCardListeners(container);
    } catch (error) {
      console.error('Schedule load error:', error);
      container.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">Failed to load schedule. Please try again.</p>';
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SchedulePage.init();
});
