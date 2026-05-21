# CineStream

Premium movie & TV streaming website built with vanilla HTML/CSS/JS + TMDB API.

## Features
- Cinematic dark UI with glassmorphism & neon effects
- Hero slider, continue watching, schedules
- Serverless: runs on Cloudflare Pages + Workers
- No user accounts, all data stored locally
- PWA ready

## Deployment
1. Deploy `cloudflare/worker.js` to Cloudflare Workers, route `/api/tmdb/*`.
2. Upload all other files to Cloudflare Pages or GitHub Pages.
3. Ensure the worker URL is accessible from the frontend (same domain or proxy).
