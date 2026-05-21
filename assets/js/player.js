function getEmbedUrl(type, server, tmdbId, season, episode) {
  const servers = {
    vidstorm: 'https://vidstorm.ru',
    vidrock: 'https://vidrock.ru',
    vidplus: 'https://player.vidplus.to/embed'
  };
  if (type === 'movie') {
    return `${servers[server]}/movie/${tmdbId}`;
  } else {
    return `${servers[server]}/tv/${tmdbId}/${season}/${episode}`;
  }
}
