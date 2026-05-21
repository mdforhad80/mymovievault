// ============================================
// JIKAN API WRAPPER
// ============================================

const API = {
  BASE_URL: 'https://api.jikan.moe/v4',
  CACHE: new Map(),
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  async fetch(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;

    // Check cache
    const cached = this.CACHE.get(url);
    if (cached && Date.now() - cached.time < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Cache response
      this.CACHE.set(url, { data, time: Date.now() });
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get anime by ID
  getAnime(id) {
    return this.fetch(`/anime/${id}/full`);
  },

  // Get anime characters
  getCharacters(id) {
    return this.fetch(`/anime/${id}/characters`);
  },

  // Get anime episodes
  getEpisodes(id, page = 1) {
    return this.fetch(`/anime/${id}/episodes`, { page });
  },

  // Get recommendations
  getRecommendations(id) {
    return this.fetch(`/anime/${id}/recommendations`);
  },

  // Search anime
  searchAnime(query, params = {}) {
    const searchParams = { q: query, ...params };
    return this.fetch('/anime', searchParams);
  },

  // Get top anime
  getTopAnime(filter = '', page = 1, limit = 25) {
    return this.fetch('/top/anime', { filter, page, limit });
  },

  // Get seasonal anime
  getSeasonal(season = '', year = '', page = 1, limit = 25) {
    const params = { page, limit };
    if (season) params.filter = season;
    if (year) params.year = year;
    return this.fetch('/seasons/now', params);
  },

  // Get upcoming anime
  getUpcoming(page = 1, limit = 25) {
    return this.fetch('/seasons/upcoming', { page, limit });
  },

  // Get schedule
  getSchedule(day = '') {
    const params = day ? { filter: day } : {};
    return this.fetch('/schedules', params);
  },

  // Get random anime
  getRandomAnime() {
    return this.fetch('/random/anime');
  },

  // Get anime by genre
  getAnimeByGenre(genreId, page = 1, limit = 25) {
    return this.fetch('/anime', { genres: genreId, page, limit });
  },

  // Get genres list
  getGenres() {
    return this.fetch('/genres/anime');
  }
};

// Predefined popular anime IDs for hero and featured sections
const FEATURED_ANIME_IDS = [
  5114,   // Fullmetal Alchemist: Brotherhood
  9253,   // Steins;Gate
  28977,  // Gintama
  38524,  // Attack on Titan S3 P2
  9969,   // Gintama'
  11061,  // Hunter x Hunter (2011)
  820,    // Ginga Eiyuu Densetsu
  15417,  // Gintama': Enchousen
  35180,  // 3-gatsu no Lion 2
  28851,  // Koe no Katachi
  32281,  // Kimi no Na wa
  42938,  // Fruits Basket: The Final
  34096,  // Gintama (2017)
  15335,  // Gintama Movie 2
  37987,  // Violet Evergarden Movie
  4181,   // Clannad After Story
  19,     // Monster
  40028,  // Shingeki no Kyojin: The Final Season
  37430,  // Tensei shitara Slime Datta Ken
  40748,  // Jujutsu Kaisen
  21,     // One Piece
  1735,   // Naruto: Shippuuden
  20,     // Naruto
  269,    // Bleach
  1,      // Cowboy Bebop
  164,    // Mononoke Hime
  199,    // Sen to Chihiro no Kamikakushi
  22319,  // Tokyo Ghoul
  23273,  // Shigatsu wa Kimi no Uso
  28171,  // Shokugeki no Souma
  30276,  // One Punch Man
  31964,  // Boku no Hero Academia
  38000,  // Kimetsu no Yaiba
  39535,  // Mushoku Tensei
  41488,  // Kaguya-sama: Love Is War
  43608,  // Chainsaw Man
  48583,  // Spy x Family
  50265,  // Sono Bisque Doll wa Koi wo Suru
  52034,  // Oshi no Ko
  52991,  // Sousou no Frieren
  54492,  // Kusuriya no Hitorigoto
  54789,  // Boku no Hero Academia 7
  55888,  // Mashle: Magic and Muscles S2
  56784,  // Bleach: Sennen Kessen-hen - Ketsubetsu-tan
  57181,  // Ao no Hako
  57864,  // Haikyuu!! Movie: Gomisuteba no Kessen
  58059,  // Jujutsu Kaisen 2nd Season
  58511,  // Shikanoko Nokonoko Koshitantan
  58514,  // Kuroshitsuji: Kishuku Gakkou-hen
  58717,  // Kimetsu no Yaiba Movie
  59095,  // Fairy Tail: 100 Years Quest
];

// Genre mapping
const GENRE_MAP = {
  1: 'Action', 2: 'Adventure', 4: 'Comedy', 8: 'Drama',
  10: 'Fantasy', 14: 'Horror', 22: 'Romance', 24: 'Sci-Fi',
  36: 'Slice of Life', 37: 'Supernatural', 30: 'Sports'
};
