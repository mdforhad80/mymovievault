// storage.js – localStorage wrapper for watch history & continue watching
const STORAGE_KEYS = {
  HISTORY: 'cine_history',
  CONTINUE: 'cine_continue',
  SETTINGS: 'cine_settings'
};

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
  } catch { return []; }
}
function addToHistory(item) {
  const history = getHistory().filter(h => h.id !== item.id || h.type !== item.type);
  history.unshift({ ...item, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50))); // keep latest 50
}

function getContinueWatching() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTINUE)) || [];
  } catch { return []; }
}
function updateContinueWatching(item) {
  const list = getContinueWatching().filter(c => !(c.id === item.id && c.type === item.type && c.season === item.season));
  list.unshift(item);
  localStorage.setItem(STORAGE_KEYS.CONTINUE, JSON.stringify(list.slice(0, 30)));
}
function removeContinueWatching(id, type) {
  let list = getContinueWatching();
  list = list.filter(c => !(c.id === id && c.type === type));
  localStorage.setItem(STORAGE_KEYS.CONTINUE, JSON.stringify(list));
}

// Settings (like server preference)
function getSetting(key, def) {
  try {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    return settings[key] !== undefined ? settings[key] : def;
  } catch { return def; }
}
function setSetting(key, value) {
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
  settings[key] = value;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
