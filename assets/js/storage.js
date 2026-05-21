const CW_KEY = 'continueWatching';
const HISTORY_KEY = 'watchHistory';

export function getContinueWatching() {
  try {
    return JSON.parse(localStorage.getItem(CW_KEY)) || [];
  } catch {
    return [];
  }
}

export function addContinueWatching(item) {
  const list = getContinueWatching();
  const existing = list.findIndex(i => i.id === item.id && i.type === item.type);
  if (existing !== -1) list.splice(existing, 1);
  list.unshift(item);
  if (list.length > 20) list.pop();
  localStorage.setItem(CW_KEY, JSON.stringify(list));
}

export function removeContinueWatching(id, type) {
  const list = getContinueWatching().filter(i => !(i.id === id && i.type === type));
  localStorage.setItem(CW_KEY, JSON.stringify(list));
}

export function getWatchHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToHistory(item) {
  const list = getWatchHistory();
  const existing = list.findIndex(i => i.id === item.id && i.type === item.type);
  if (existing !== -1) list.splice(existing, 1);
  list.unshift({ ...item, watchedAt: new Date().toISOString() });
  if (list.length > 50) list.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
