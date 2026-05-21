// Configuration
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const STREAM_BASE = 'https://megaplay.buzz/stream/mal';

// Helper functions
function fetchJSON(url) {
    return fetch(url).then(r => r.json());
}

// Load anime details
async function loadAnimeDetail(malId) {
    const container = document.getElementById('animeDetail');
    try {
        const data = await fetchJSON(`${JIKAN_BASE}/anime/${malId}/full`);
        const anime = data.data;
        const episodes = anime.episodes || 0;

        // Build HTML
        let html = `
            <div class="anime-header">
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" class="anime-poster">
                <div class="anime-info">
                    <h1>${anime.title}</h1>
                    <div class="meta">
                        <span>${anime.type || 'TV'}</span>
                        <span>${anime.status}</span>
                        <span>${episodes} Episodes</span>
                        <span>${anime.score || 'N/A'}</span>
                    </div>
                    <p class="synopsis">${anime.synopsis || 'No synopsis available.'}</p>
                    <div class="genres">
                        ${anime.genres.map(g => `<span class="genre">${g.name}</span>`).join('')}
                    </div>
                    <a href="watch.html?id=${malId}&ep=1&type=sub" class="btn-play">▶ Watch Now</a>
                </div>
            </div>
            <div class="episodes-section">
                <h2>Episodes</h2>
                <div class="episode-grid">
                    ${Array.from({ length: Math.min(episodes, 50) }, (_, i) => `
                        <a href="watch.html?id=${malId}&ep=${i+1}&type=sub" class="episode-card">
                            <span class="ep-num">${i+1}</span>
                            <span class="ep-label">Episode ${i+1}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML = html;
        document.title = `${anime.title} – KaiCrush`;
    } catch (e) {
        container.innerHTML = `<p>Error loading anime: ${e.message}</p>`;
    }
}

// Load watch page
async function loadWatchPage(malId, ep, type) {
    const player = document.getElementById('playerFrame');
    const titleEl = document.getElementById('watchTitle');
    const epDisplay = document.getElementById('epDisplay');
    const epList = document.getElementById('episodeList');

    // Fetch anime info for title
    try {
        const data = await fetchJSON(`${JIKAN_BASE}/anime/${malId}`);
        const anime = data.data;
        const totalEps = anime.episodes || 0;
        titleEl.textContent = `${anime.title} – Episode ${ep}`;
        document.title = `${anime.title} Ep ${ep} – KaiCrush`;

        // Build stream URL
        const streamUrl = `${STREAM_BASE}/${malId}/${ep}/${type}`;
        player.src = streamUrl;

        // Build episode list
        epList.innerHTML = Array.from({ length: Math.min(totalEps, 50) }, (_, i) => `
            <a href="watch.html?id=${malId}&ep=${i+1}&type=${type}" class="ep-item ${i+1 === ep ? 'active' : ''}">
                ${i+1}
            </a>
        `).join('');

        // Prev/Next buttons
        document.getElementById('prevEp').onclick = () => {
            if (ep > 1) window.location.href = `watch.html?id=${malId}&ep=${ep-1}&type=${type}`;
        };
        document.getElementById('nextEp').onclick = () => {
            if (ep < totalEps) window.location.href = `watch.html?id=${malId}&ep=${ep+1}&type=${type}`;
        };

        // Server tabs
        document.querySelectorAll('.server-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const newType = btn.dataset.type;
                window.location.href = `watch.html?id=${malId}&ep=${ep}&type=${newType}`;
            };
        });

        // Save to watch history
        saveWatchHistory(malId, ep, type, anime.title, anime.images.jpg.image_url);
    } catch (e) {
        console.error(e);
        document.getElementById('watchContainer').innerHTML = `<p>Error loading watch page: ${e.message}</p>`;
    }
}

// Watch history (localStorage)
function saveWatchHistory(malId, ep, type, title, image) {
    let history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const entry = { malId, ep, type, title, image, timestamp: Date.now() };
    history = history.filter(h => h.malId !== malId);
    history.unshift(entry);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('watchHistory', JSON.stringify(history));
}

// Load continue watching grid
function loadContinueWatching() {
    const grid = document.getElementById('continueGrid');
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    if (!history.length) {
        grid.innerHTML = '<p class="empty-state">No watch history yet.</p>';
        return;
    }
    grid.innerHTML = history.slice(0, 12).map(item => `
        <a href="watch.html?id=${item.malId}&ep=${item.ep}&type=${item.type}" class="anime-card">
            <div class="poster"><img src="${item.image}" alt="${item.title}"></div>
            <div class="card-info">
                <h4>${item.title}</h4>
                <span class="sub">Ep ${item.ep}</span>
            </div>
        </a>
    `).join('');
}

// Load homepage featured (top airing)
async function loadFeatured() {
    const wrapper = document.getElementById('featuredWrapper');
    try {
        const data = await fetchJSON(`${JIKAN_BASE}/top/anime?filter=airing&limit=6`);
        wrapper.innerHTML = data.data.map(anime => `
            <div class="slide">
                <div class="slide-bg" style="background-image: url(${anime.images.jpg.large_image_url})"></div>
                <div class="slide-content">
                    <h2>${anime.title}</h2>
                    <p>${anime.synopsis?.slice(0, 120) || ''}...</p>
                    <a href="anime.html?id=${anime.mal_id}" class="btn-primary">View Details</a>
                </div>
            </div>
        `).join('');
    } catch (e) {
        wrapper.innerHTML = '<p>Failed to load featured.</p>';
    }
}

// Load latest releases (by season)
async function loadLatest() {
    const grid = document.getElementById('latestGrid');
    try {
        const data = await fetchJSON(`${JIKAN_BASE}/seasons/now?limit=12`);
        grid.innerHTML = data.data.map(anime => animeCard(anime)).join('');
    } catch (e) {
        grid.innerHTML = '<p>Failed to load latest.</p>';
    }
}

// Load trending
async function loadTrending() {
    const grid = document.getElementById('trendingGrid');
    try {
        const data = await fetchJSON(`${JIKAN_BASE}/top/anime?filter=bypopularity&limit=12`);
        grid.innerHTML = data.data.map(anime => animeCard(anime)).join('');
    } catch (e) {
        grid.innerHTML = '<p>Failed to load trending.</p>';
    }
}

// Anime card HTML helper
function animeCard(anime) {
    return `
        <a href="anime.html?id=${anime.mal_id}" class="anime-card">
            <div class="poster">
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" loading="lazy">
            </div>
            <div class="card-info">
                <h4>${anime.title}</h4>
                <div class="meta">
                    <span>${anime.type || 'TV'}</span>
                    <span>⭐ ${anime.score || 'N/A'}</span>
                </div>
            </div>
        </a>
    `;
}

// Initialize homepage
if (document.getElementById('featuredWrapper')) {
    loadFeatured();
    loadLatest();
    loadTrending();
    loadContinueWatching();
}

// Genre list in sidebar
async function loadGenres() {
    const list = document.getElementById('genreList');
    try {
        const data = await fetchJSON(`${JIKAN_BASE}/genres/anime`);
        list.innerHTML = data.data.map(g => `
            <a href="search.html?genre=${g.mal_id}" class="genre-link">${g.name}</a>
        `).join('');
    } catch (e) {
        list.innerHTML = '<p>Failed to load genres.</p>';
    }
}
if (document.getElementById('genreList')) loadGenres();

// Sidebar toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// NSFW toggle (simple filter)
document.getElementById('nsfwToggle')?.addEventListener('click', function() {
    this.classList.toggle('on');
    document.body.classList.toggle('nsfw-hidden');
});

// Service worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
