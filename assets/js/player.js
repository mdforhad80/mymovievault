// ============================================
// WATCH PAGE / PLAYER
// ============================================

const Player = {
  animeId: null,
  currentEpisode: 1,
  currentType: 'sub',
  animeData: null,
  totalEpisodes: 12,

  async init() {
    this.animeId = Utils.getParam('id');
    this.currentEpisode = parseInt(Utils.getParam('ep')) || 1;
    this.currentType = Utils.getParam('type') || 'sub';

    if (!this.animeId) {
      window.location.href = 'index.html';
      return;
    }

    await this.loadAnime();
    this.setupPlayer();
    this.setupControls();
    this.loadEpisodes();
    this.loadRelated();
    this.setupKeyboardShortcuts();
    hideLoadingScreen();
  },

  async loadAnime() {
    try {
      const data = await API.getAnime(this.animeId);
      this.animeData = data.data;
      this.totalEpisodes = this.animeData.episodes || 12;

      // Update title
      const title = this.animeData.title_english || this.animeData.title;
      document.title = `${title} - Episode ${this.currentEpisode} - AnimeStream`;

      const watchTitle = document.getElementById('watchTitle');
      const watchMeta = document.getElementById('watchMeta');

      if (watchTitle) watchTitle.textContent = `${title} - Episode ${this.currentEpisode}`;
      if (watchMeta) {
        watchMeta.innerHTML = `
          ${this.animeData.type || 'TV'} • 
          Episode ${this.currentEpisode}/${this.totalEpisodes} • 
          ${this.animeData.duration || '24 min'} • 
          ${this.currentType.toUpperCase()}
        `;
      }
    } catch (error) {
      console.error('Player load error:', error);
      UI.showToast('Failed to load anime', 'error');
    }
  },

  setupPlayer() {
    const player = document.getElementById('videoPlayer');
    if (!player) return;

    const streamUrl = Utils.getStreamUrl(this.animeId, this.currentEpisode, this.currentType);
    player.src = streamUrl;

    // Save to history
    const title = this.animeData?.title_english || this.animeData?.title || 'Unknown';
    const poster = this.animeData?.images?.jpg?.image_url || '';
    Storage.addToHistory(this.animeId, title, this.currentEpisode, this.currentType, poster);

    // Save progress for continue watching
    Storage.saveProgress(
      this.animeId,
      title,
      this.currentEpisode,
      this.totalEpisodes,
      this.currentType,
      poster,
      0
    );
  },

  setupControls() {
    // Type switch
    const typeSwitch = document.getElementById('typeSwitch');
    if (typeSwitch) {
      typeSwitch.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          typeSwitch.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentType = btn.dataset.type;
          this.updatePlayer();
        });
      });
    }

    // Prev/Next buttons
    const prevBtn = document.getElementById('prevEpBtn');
    const nextBtn = document.getElementById('nextEpBtn');

    if (prevBtn) {
      prevBtn.disabled = this.currentEpisode <= 1;
      prevBtn.addEventListener('click', () => {
        if (this.currentEpisode > 1) {
          this.navigateToEpisode(this.currentEpisode - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentEpisode >= this.totalEpisodes;
      nextBtn.addEventListener('click', () => {
        if (this.currentEpisode < this.totalEpisodes) {
          this.navigateToEpisode(this.currentEpisode + 1);
        }
      });
    }
  },

  navigateToEpisode(episode) {
    window.location.href = `watch.html?id=${this.animeId}&ep=${episode}&type=${this.currentType}`;
  },

  updatePlayer() {
    const player = document.getElementById('videoPlayer');
    if (player) {
      player.src = Utils.getStreamUrl(this.animeId, this.currentEpisode, this.currentType);
    }

    // Update meta
    const watchMeta = document.getElementById('watchMeta');
    if (watchMeta) {
      const title = this.animeData?.title_english || this.animeData?.title || 'Unknown';
      watchMeta.innerHTML = `
        ${this.animeData?.type || 'TV'} • 
        Episode ${this.currentEpisode}/${this.totalEpisodes} • 
        ${this.animeData?.duration || '24 min'} • 
        ${this.currentType.toUpperCase()}
      `;
    }

    // Update title
    document.title = `${this.animeData?.title_english || this.animeData?.title || 'Anime'} - Episode ${this.currentEpisode} - AnimeStream`;

    // Save progress
    const title = this.animeData?.title_english || this.animeData?.title || 'Unknown';
    const poster = this.animeData?.images?.jpg?.image_url || '';
    Storage.saveProgress(this.animeId, title, this.currentEpisode, this.totalEpisodes, this.currentType, poster, 0);
  },

  loadEpisodes() {
    const container = document.getElementById('episodeList');
    if (!container) return;

    const episodes = [];
    for (let i = 1; i <= this.totalEpisodes; i++) {
      episodes.push({
        episode: i,
        servers: [
          {
            sub: 'VidCloud',
            value: `https://megaplay.buzz/stream/mal/${this.animeId}/${i}/sub`
          },
          {
            dub: 'VidCloud',
            value: `https://megaplay.buzz/stream/mal/${this.animeId}/${i}/dub`
          }
        ]
      });
    }

    container.innerHTML = episodes.map(ep => `
      <a href="watch.html?id=${this.animeId}&ep=${ep.episode}&type=${this.currentType}" 
         class="episode-item ${ep.episode === this.currentEpisode ? 'active' : ''}">
        <div class="episode-number">${ep.episode}</div>
        <div class="episode-info">
          <div class="episode-title">Episode ${ep.episode}</div>
          <div class="episode-meta">${this.animeData?.duration || '24 min'}</div>
        </div>
        <div class="episode-type">
          <span class="sub">SUB</span>
          <span class="dub">DUB</span>
        </div>
      </a>
    `).join('');
  },

  async loadRelated() {
    const container = document.getElementById('relatedGrid');
    if (!container || !this.animeData) return;

    const related = [
      ...(this.animeData.relations || []).flatMap(r => r.entry || [])
    ].filter(r => r.type === 'anime').slice(0, 6);

    if (related.length === 0) {
      // Fallback: search for similar anime
      try {
        const genre = this.animeData.genres?.[0]?.mal_id;
        if (genre) {
          const data = await API.getAnimeByGenre(genre, 1, 6);
          UI.renderAnimeGrid(container, data.data || []);
        }
      } catch (e) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center">No related anime.</p>';
      }
      return;
    }

    const animes = [];
    for (const rel of related) {
      try {
        const data = await API.getAnime(rel.mal_id);
        if (data.data) animes.push(data.data);
      } catch (e) {
        // Skip
      }
    }

    UI.renderAnimeGrid(container, animes);
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only if not typing in input
      if (document.activeElement.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
          if (this.currentEpisode > 1) {
            this.navigateToEpisode(this.currentEpisode - 1);
          }
          break;
        case 'ArrowRight':
          if (this.currentEpisode < this.totalEpisodes) {
            this.navigateToEpisode(this.currentEpisode + 1);
          }
          break;
        case 'f':
          const player = document.getElementById('videoPlayer');
          if (player && player.requestFullscreen) {
            player.requestFullscreen();
          }
          break;
        case ' ':
          e.preventDefault();
          // Space to toggle play/pause would need player API access
          break;
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Player.init();
});
