export function getParams() {
  return new URLSearchParams(window.location.search);
}

export function navigateTo(url) {
  window.location.href = url;
}

export function buildWatchUrl(id, type, options = {}) {
  if (type === 'movie') {
    return `watch.html?id=${id}&type=movie&server=${options.server || 'vidplus'}`;
  }
  return `watch.html?id=${id}&type=tv&season=${options.season || 1}&episode=${options.episode || 1}&server=${options.server || 'vidplus'}`;
}
