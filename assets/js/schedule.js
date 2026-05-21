// schedule.js – Load schedule page
async function loadSchedule() {
  const container = document.getElementById('schedule-content');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';
  try {
    const [nowPlaying, upcoming, airingToday, onAir] = await Promise.all([
      getNowPlayingMovies(),
      getUpcomingMovies(),
      getAiringTodayTV(),
      getOnTheAirTV()
    ]);

    container.innerHTML = `
      <h2>🎥 Now Playing in Theaters</h2>
      <div class="grid">${nowPlaying.results.slice(0, 6).map(m => createCard(m, 'movie')).join('')}</div>
      <h2>📅 Upcoming Movies</h2>
      <div class="grid">${upcoming.results.slice(0, 6).map(m => createCard(m, 'movie')).join('')}</div>
      <h2>📺 TV Airing Today</h2>
      <div class="grid">${airingToday.results.slice(0, 6).map(t => createCard(t, 'tv')).join('')}</div>
      <h2>🔥 TV On The Air</h2>
      <div class="grid">${onAir.results.slice(0, 6).map(t => createCard(t, 'tv')).join('')}</div>
    `;
  } catch (err) {
    container.innerHTML = '<p>Failed to load schedule.</p>';
  }
}
