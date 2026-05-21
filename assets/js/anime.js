// ============================================
// ANIME DETAILS PAGE
// ============================================

const AnimePage = {
  animeId: null,
  animeData: null,
  currentType: 'sub',

  async init() {
    this.animeId = Utils.getParam('id');
    if (!this.animeId) {
      window.location.href = 'index.html';
      return;
    }

    await this.loadAnime();
    this.setupTypeSwitch();
    hideLoadingScreen();
  },

  async loadAnime() {
    try {
      const data = await API.getAnime(this.animeId);
      this.animeData = data.data;
      if (!this.animeData) throw new Error('Anime not found');

      this.renderHero();
      this.renderInfo();
      this.renderGenres();
      this.renderEpisodes();
      this.renderCharacters();
      this.renderRelated();
      this.renderRecommendations();
      this.renderTrailer();

      // Update page title
      document.title = `${this.animeData.title_english || this.animeData.title} - AnimeStream`;
    } catch (error) {
      console.error('Anime load error:', error);
      UI.showToast('Failed to load anime details', 'error');
    }
  },

  renderHero() {
    const anime = this.animeData;
    const bg = document.getElementById('animeHeroBg');
    const poster = document.getElementById('animePosterImg');
    const title = document.getElementById('animeTitle');
    const altTitle = document.getElementById('animeAltTitle');
    const meta = document.getElementById('animeMeta');
    const desc = document.getElementById('animeDesc');
    const actions = document.getElementById('animeActions');

    const bgImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const posterImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const mainTitle = anime.title_english || anime.title;
    const altTitles = [anime.title_japanese, ...(anime.title_synonyms || [])].filter(Boolean).join(' / ');
    const score = anime.score || 'N/A';
    const type = anime.type || 'TV';
    const episodes = anime.episodes || '?';
    const status = anime.status || 'Unknown';
    const rating = anime.rating || 'N/A';

    if (bg) bg.style.backgroundImage = `url('${bgImage}')`;
    if (poster) poster.src = posterImage;
    if (title) title.textContent = mainTitle;
    if (altTitle) altTitle.textContent = altTitles || '';
    if (desc) desc.textContent = Utils.truncate(anime.synopsis, 300);

    if (meta) {
      meta.innerHTML = `
        <span class="rating-large">⭐ ${score}</span>
        <span class="status-badge">${status}</span>
        <span>${rating}</span>
        <span>${type}</span>
        <span>${episodes} Episodes</span>
      `;
    }

    if (actions) {
      const continueItem = Storage.getContinueWatching().find(i => i.animeId === parseInt(this.animeId));
      const nextEp = continueItem ? continueItem.episode : 1;

      actions.innerHTML = `
        <a href="watch.html?id=${this.animeId}&ep=${nextEp}&type=sub" class="btn btn-primary">
          <span>▶</span> Watch Episode ${nextEp}
        </a>
        <a href="watch.html?id=${this.animeId}&ep=1&type=sub" class="btn btn-secondary">
          <span>📺</span> Start from Beginning
        </a>
      `;
    }
  },

  renderInfo() {
    const anime = this.animeData;
    const list = document.getElementById('animeInfoList');
    if (!list) return;

    const premiered = anime.season && anime.year ? `${Utils.capitalize(anime.season)} ${anime.year}` : 'N/A';
    const aired = anime.aired?.string || 'N/A';
    const broadcast = anime.broadcast?.string || 'N/A';
    const duration = anime.duration || 'N/A';
    const studios = anime.studios?.map(s => s.name).join(', ') || 'N/A';
    const producers = anime.producers?.map(p => p.name).join(', ') || 'N/A';
    const licensors = anime.licensors?.map(l => l.name).join(', ') || 'N/A';
    const source = anime.source || 'N/A';
    const rank = anime.rank ? `#${anime.rank}` : 'N/A';
    const popularity = anime.popularity ? `#${anime.popularity}` : 'N/A';
    const members = Utils.formatNumber(anime.members);
    const favorites = Utils.formatNumber(anime.favorites);

    list.innerHTML = `
      <li><span class="label">English:</span><span class="value">${Utils.escapeHtml(anime.title_english || 'N/A')}</span></li>
      <li><span class="label">Japanese:</span><span class="value">${Utils.escapeHtml(anime.title_japanese || 'N/A')}</span></li>
      <li><span class="label">Type:</span><span class="value">${anime.type || 'N/A'}</span></li>
      <li><span class="label">Episodes:</span><span class="value">${anime.episodes || 'N/A'}</span></li>
      <li><span class="label">Status:</span><span class="value">${anime.status || 'N/A'}</span></li>
      <li><span class="label">Aired:</span><span class="value">${aired}</span></li>
      <li><span class="label">Premiered:</span><span class="value">${premiered}</span></li>
      <li><span class="label">Broadcast:</span><span class="value">${broadcast}</span></li>
      <li><span class="label">Duration:</span><span class="value">${duration}</span></li>
      <li><span class="label">Rating:</span><span class="value">${anime.rating || 'N/A'}</span></li>
      <li><span class="label">Score:</span><span class="value">${anime.score || 'N/A'} (${anime.scored_by ? Utils.formatNumber(anime.scored_by) + ' users' : 'N/A'})</span></li>
      <li><span class="label">Rank:</span><span class="value">${rank}</span></li>
      <li><span class="label">Popularity:</span><span class="value">${popularity}</span></li>
      <li><span class="label">Members:</span><span class="value">${members}</span></li>
      <li><span class="label">Favorites:</span><span class="value">${favorites}</span></li>
      <li><span class="label">Source:</span><span class="value">${source}</span></li>
      <li><span class="label">Studios:</span><span class="value">${studios}</span></li>
      <li><span class="label">Producers:</span><span class="value">${producers}</span></li>
      <li><span class="label">Licensors:</span><span class="value">${licensors}</span></li>
      <li><span class="label">MAL:</span><span class="value"><a href="https://myanimelist.net/anime/${this.animeId}/" target="_blank">View on MyAnimeList ↗</a></span></li>
    `;
  },

  renderGenres() {
    const anime = this.animeData;
    const container = document.getElementById('genreList');
    if (!container) return;

    const genres = anime.genres || [];
    container.innerHTML = genres.map(g => 
      `<a href="search.html?genre=${g.mal_id}" class="genre-tag">${g.name}</a>`
    ).join('');
  },

  renderEpisodes() {
    const anime = this.animeData;
    const container = document.getElementById('episodeList');
    if (!container) return;

    const episodes = anime.episodes || 12;
    const epList = [];

    for (let i = 1; i <= episodes; i++) {
      const isActive = false; // Will be determined by current watch state
      epList.push({
        episode: i,
        servers: [
          { name: 'VidCloud', sub: `https://megaplay.buzz/stream/mal/${this.animeId}/${i}/sub`, dub: `https://megaplay.buzz/stream/mal/${this.animeId}/${i}/dub` }
        ]
      });
    }

    container.innerHTML = epList.map((ep, index) => `
      <a href="watch.html?id=${this.animeId}&ep=${ep.episode}&type=${this.currentType}" class="episode-item ${isActive ? 'active' : ''}">
        <div class="episode-number">${ep.episode}</div>
        <div class="episode-info">
          <div class="episode-title">Episode ${ep.episode}</div>
          <div class="episode-meta">${anime.duration || '24 min'}</div>
        </div>
        <div class="episode-type">
          <span class="sub">SUB</span>
          <span class="dub">DUB</span>
        </div>
      </a>
    `).join('');
  },

  setupTypeSwitch() {
    const typeSwitch = document.getElementById('typeSwitch');
    if (!typeSwitch) return;

    typeSwitch.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        typeSwitch.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentType = btn.dataset.type;
        this.renderEpisodes();
      });
    });
  },

  async renderCharacters() {
    const container = document.getElementById('charactersGrid');
    if (!container) return;

    try {
      const data = await API.getCharacters(this.animeId);
      const characters = (data.data || []).slice(0, 12);

      container.innerHTML = characters.map(char => {
        const c = char.character || char;
        return `
          <div class="anime-card">
            <div class="anime-card-poster">
              <img src="${c.images?.jpg?.image_url || ''}" alt="${Utils.escapeHtml(c.name || '')}" loading="lazy">
            </div>
            <div class="anime-card-info">
              <h3 class="anime-card-title">${Utils.escapeHtml(c.name || 'Unknown')}</h3>
              <div class="anime-card-meta">
                <span>${char.role || 'Character'}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">Failed to load characters.</p>';
    }
  },

  async renderRelated() {
    const container = document.getElementById('relatedGrid');
    if (!container) return;

    const anime = this.animeData;
    const related = [
      ...(anime.relations || []).flatMap(r => r.entry || [])
    ].filter(r => r.type === 'anime').slice(0, 12);

    if (related.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center">No related anime found.</p>';
      return;
    }

    // Fetch details for related anime
    const animes = [];
    for (const rel of related) {
      try {
        const data = await API.getAnime(rel.mal_id);
        if (data.data) animes.push(data.data);
      } catch (e) {
        // Skip
      }
      if (animes.length >= 6) break;
    }

    UI.renderAnimeGrid(container, animes);
  },

  async renderRecommendations() {
    const container = document.getElementById('recommendationsGrid');
    if (!container) return;

    try {
      const data = await API.getRecommendations(this.animeId);
      const recs = (data.data || []).slice(0, 12);

      if (recs.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center">No recommendations available.</p>';
        return;
      }

      // Fetch details for recommendations
      const animes = [];
      for (const rec of recs) {
        const entry = rec.entry || rec;
        try {
          const data = await API.getAnime(entry.mal_id);
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

  renderTrailer() {
    const container = document.getElementById('trailerContainer');
    if (!container) return;

    const trailer = this.animeData.trailer;
    if (!trailer || !trailer.embed_url) {
      container.innerHTML = '<p style="color:var(--muted)">No trailer available.</p>';
      return;
    }

    container.innerHTML = `
      <div style="position:relative;padding-bottom:56.25%;border-radius:var(--radius-md);overflow:hidden">
        <iframe 
          src="${trailer.embed_url}" 
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
          allowfullscreen
          loading="lazy"
          title="Trailer"
        ></iframe>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AnimePage.init();
});
