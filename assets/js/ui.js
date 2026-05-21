// ui.js – DOM helpers, card rendering, skeleton loading
function createCard(item, type) {
  const isMovie = type === 'movie';
  const title = isMovie ? item.title : item.name;
  const poster = item.poster_path 
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
    : 'data:image/svg+xml,...'; // placeholder
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const year = (isMovie ? item.release_date : item.first_air_date)?.split('-')[0] || '';
  const link = `movie.html?id=${item.id}&type=${type}`;
  
  return `
    <a href="${link}" class="card glass-card">
      <div class="card-img">
        <img src="${poster}" alt="${title}" loading="lazy">
        <span class="card-rating">⭐ ${rating}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <p class="card-meta">${year} · ${isMovie ? 'Movie' : 'TV'}</p>
      </div>
    </a>
  `;
}

function renderCards(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.map(item => createCard(item, type)).join('');
}

// Show skeleton loaders
function skeletonCard() {
  return `<div class="card skeleton"></div>`;
}
function renderSkeletons(containerId, count = 8) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = Array(count).fill(skeletonCard()).join('');
  }
}

// Hero slider
let heroSwiper;
function initHeroSlider(slides) {
  const swiperWrapper = document.getElementById('hero-slides');
  if (!swiperWrapper) return;
  swiperWrapper.innerHTML = slides.map(slide => {
    const backdrop = slide.backdrop_path
      ? `https://image.tmdb.org/t/p/original${slide.backdrop_path}`
      : '';
    return `
      <div class="swiper-slide hero-slide" style="background-image: url(${backdrop})">
        <div class="hero-content">
          <h1>${slide.title || slide.name}</h1>
          <p>${slide.overview?.substring(0, 200)}...</p>
          <a href="movie.html?id=${slide.id}&type=${slide.media_type || (slide.title ? 'movie' : 'tv')}" class="btn primary">▶ Watch Now</a>
        </div>
      </div>
    `;
  }).join('');

  if (heroSwiper) heroSwiper.destroy();
  heroSwiper = new Swiper('.swiper', {
    loop: true,
    autoplay: { delay: 5000 },
    pagination: { el: '.swiper-pagination', clickable: true },
    effect: 'fade',
    fadeEffect: { crossFade: true }
  });
}

// Particles background (simple canvas)
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5
    });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(139,92,246,0.15)';
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
