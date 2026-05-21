# StreamVault - Cinematic Movie & TV Streaming Platform

A premium, Netflix-inspired streaming interface powered by TMDB API.

## Features

- Movies & TV Shows via TMDB API
- Multiple streaming servers (VidStorm, VidRock, VidPlus)
- Continue Watching & Watch History (localStorage)
- Responsive design with glassmorphism & neon effects
- PWA support with offline caching
- Cloudflare Worker API proxy included
- Keyboard shortcuts (F for fullscreen, arrows for episode nav)
- Theater mode
- Search with live suggestions & infinite scroll

## Pages

- `index.html` - Home with trending, popular, upcoming
- `movie.html?id={tmdb_id}` - Movie details
- `show.html?id={tmdb_id}` - TV show details with seasons/episodes
- `watch.html` - Video player with server switching
- `search.html?q={query}` - Search with filters
- `trending.html` - All trending content
- `movies.html` - Popular movies
- `tv.html` - Popular TV shows
- `schedule.html` - TV airing today
- `creator.html` - Creator profile placeholder

## Deployment

### GitHub Pages
Upload to GitHub repository and enable Pages in Settings.

### Cloudflare Pages
Deploy via Cloudflare Pages dashboard for edge caching.

## API

Uses TMDB API with the following endpoints:
- Trending: `/trending/all/day`
- Movie details: `/movie/{id}`
- TV details: `/tv/{id}`
- Search: `/search/multi`

## License

For educational purposes only.
