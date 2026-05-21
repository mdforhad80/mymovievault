// ============================================
// STORAGE MANAGER (localStorage)
// ============================================

const Storage = {
  KEYS: {
    WATCH_HISTORY: 'as_watch_history',
    CONTINUE_WATCHING: 'as_continue_watching',
    SETTINGS: 'as_settings'
  },

  // Watch History
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.WATCH_HISTORY)) || [];
    } catch {
      return [];
    }
  },

  addToHistory(animeId, title, episode, type, poster, timestamp = Date.now()) {
    const history = this.getHistory();
    const existing = history.findIndex(h => h.animeId === animeId && h.episode === episode);
    if (existing !== -1) {
      history.splice(existing, 1);
    }
    history.unshift({ animeId, title, episode, type, poster, timestamp });
    localStorage.setItem(this.KEYS.WATCH_HISTORY, JSON.stringify(history.slice(0, 100)));
  },

  clearHistory() {
    localStorage.removeItem(this.KEYS.WATCH_HISTORY);
  },

  // Continue Watching
  getContinueWatching() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CONTINUE_WATCHING)) || [];
    } catch {
      return [];
    }
  },

  saveProgress(animeId, title, episode, totalEpisodes, type, poster, progress = 0) {
    const items = this.getContinueWatching();
    const existing = items.findIndex(i => i.animeId === animeId);
    if (existing !== -1) {
      items[existing] = { animeId, title, episode, totalEpisodes, type, poster, progress, updatedAt: Date.now() };
    } else {
      items.unshift({ animeId, title, episode, totalEpisodes, type, poster, progress, updatedAt: Date.now() });
    }
    localStorage.setItem(this.KEYS.CONTINUE_WATCHING, JSON.stringify(items.slice(0, 50)));
  },

  removeFromContinue(animeId) {
    const items = this.getContinueWatching().filter(i => i.animeId !== animeId);
    localStorage.setItem(this.KEYS.CONTINUE_WATCHING, JSON.stringify(items));
  },

  getProgress(animeId) {
    const items = this.getContinueWatching();
    const item = items.find(i => i.animeId === animeId);
    return item ? item.episode : 1;
  },

  // Settings
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || {};
    } catch {
      return {};
    }
  },

  setSettings(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSetting(key, defaultValue = null) {
    const settings = this.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }
};
