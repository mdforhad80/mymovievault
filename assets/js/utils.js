// ============================================
// UTILITIES
// ============================================

const Utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Format number with commas
  formatNumber(num) {
    if (!num) return 'N/A';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Truncate text
  truncate(str, length = 150) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  // Get query parameter
  getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  },

  // Set query parameter
  setParam(name, value) {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(name, value);
    } else {
      url.searchParams.delete(name);
    }
    window.history.replaceState({}, '', url);
  },

  // Generate stream URL
  getStreamUrl(malId, episode, type = 'sub') {
    return `https://megaplay.buzz/stream/mal/${malId}/${episode}/${type}`;
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Random integer
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Shuffle array
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Wait for ms
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Get current season
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return 'winter';
    if (month >= 4 && month <= 6) return 'spring';
    if (month >= 7 && month <= 9) return 'summer';
    return 'fall';
  },

  // Get current year
  getCurrentYear() {
    return new Date().getFullYear();
  },

  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Generate years for filter
  generateYears(start = 1990) {
    const years = [];
    const current = this.getCurrentYear();
    for (let i = current; i >= start; i--) {
      years.push(i);
    }
    return years;
  }
};

// Particle Background
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const count = Math.min(50, Math.floor(window.innerWidth / 30));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
      this.ctx.fill();
    });

    // Connect nearby particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Cursor Glow
class CursorGlow {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.element.style.display = 'none';
      return;
    }
    document.addEventListener('mousemove', (e) => {
      this.element.style.left = e.clientX + 'px';
      this.element.style.top = e.clientY + 'px';
    });
  }
}

// Header scroll effect
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', Utils.debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, 50));
}

// Loading screen
function hideLoadingScreen() {
  const loader = document.getElementById('loadingScreen');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
  }
}

// Initialize common features
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particles-canvas');
  if (canvas) new ParticleSystem(canvas);

  const cursor = document.getElementById('cursorGlow');
  if (cursor) new CursorGlow(cursor);

  initHeader();
});
