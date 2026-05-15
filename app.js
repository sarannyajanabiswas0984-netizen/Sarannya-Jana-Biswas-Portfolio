
document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initCursor();
  initNavScroll();
  initTypewriter();

  // Route to correct section from URL param
  const view = new URLSearchParams(window.location.search).get('v') || 'profile';
  go(view, false);

  // Auto-render skills if landing on skills section
  if (view === 'skills') renderSkills('tech');
});

const ALL_SECS = ['profile', 'skills', 'projects', 'certificates', 'contact'];

function go(id, push = true) {
  // Fallback to profile if unknown id
  if (!ALL_SECS.includes(id)) id = 'profile';

  // Show / hide sections
  ALL_SECS.forEach(s => {
    const el = document.getElementById(`${s}-sec`);
    if (!el) return;
    el.classList.toggle('on', s === id);
  });

  // Highlight active nav link
  document.querySelectorAll('.nav-ul a').forEach(a => {
    a.classList.toggle('on', a.dataset.s === id);
  });

  // Auto-render skills on first open
  if (id === 'skills') renderSkills('tech');

  // Push to browser history (enables back button)
  if (push) {
    const base = location.origin + location.pathname;
    history.pushState({ v: id }, '', `${base}?v=${id}`);
  }

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Support browser back/forward
window.addEventListener('popstate', e => {
  if (e.state?.v) go(e.state.v, false);
});

function mobToggle() {
  document.getElementById('mob').classList.toggle('show');
  document.getElementById('ham').classList.toggle('x');
}

function initCursor() {
  const dot  = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  // Move dot instantly to cursor
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Lerp helper — smooth interpolation
  const lerp = (a, b, t) => a + (b - a) * t;

  // Ring follows with smooth lag
  function animateRing() {
    ringX = lerp(ringX, mouseX, 0.1);
    ringY = lerp(ringY, mouseY, 0.1);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow cursor when hovering interactive elements
  function attachHoverTargets() {
    const targets = document.querySelectorAll(
      'a, button, .cert-card, .proj-card, .sk-card, .con-card, .id-card, .tab'
    );
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    });
  }

  attachHoverTargets();

  // Re-attach after dynamic skill cards are injected
  window._refreshCursor = attachHoverTargets;
}


function initNavScroll() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initTypewriter() {
  const el = document.getElementById('tw');
  if (!el) return;

  const phrases = [
    '"Frontend Developer"',
    '"UI Enthusiast"',
    '"Web Creator"',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      // Type forward
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        return setTimeout(tick, 1800); // pause before deleting
      }
      setTimeout(tick, 70);
    } else {
      // Delete backward
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        return setTimeout(tick, 350); // pause before next phrase
      }
      setTimeout(tick, 38);
    }
  }

  setTimeout(tick, 1000); // initial delay
}


const SKILL_DATA = {
  tech: [
    { name: 'HTML5',      icon: 'fab fa-html5',    delay: 0.00 },
    { name: 'CSS3',       icon: 'fab fa-css3-alt', delay: 0.07 },
    { name: 'JavaScript', icon: 'fab fa-js',        delay: 0.14 },
    { name: 'React JS',   icon: 'fab fa-react',    delay: 0.21 },
  ],
  soft: [
    { name: 'Communication',     icon: 'fas fa-comments', delay: 0.00 },
    { name: 'Problem Solving',   icon: 'fas fa-brain',    delay: 0.07 },
    { name: 'Teamwork',          icon: 'fas fa-users',    delay: 0.14 },
    { name: 'Creative Thinking', icon: 'fas fa-bolt',     delay: 0.21 },
  ],
};

function renderSkills(type) {
  // Update toggle button state
  document.getElementById('t-tech')?.classList.toggle('on', type === 'tech');
  document.getElementById('t-soft')?.classList.toggle('on', type === 'soft');

  const grid = document.getElementById('sk-display');
  if (!grid) return;

  // Fade out
  grid.style.opacity   = '0';
  grid.style.transform = 'translateY(8px)';

  setTimeout(() => {
    // Build cards
    grid.innerHTML = SKILL_DATA[type]
      .map(s => `
        <div class="sk-card" style="animation-delay: ${s.delay}s">
          <i class="${s.icon}"></i>
          <p>${s.name}</p>
        </div>
      `)
      .join('');

    // Fade in
    grid.style.transition = 'opacity 0.2s, transform 0.2s';
    grid.style.opacity    = '1';
    grid.style.transform  = 'translateY(0)';

    // Re-attach hover targets for new DOM nodes
    if (window._refreshCursor) window._refreshCursor();
  }, 200);
}


function initStarfield() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((W * H) / 8500);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.3 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const a = s.alpha * (0.45 + 0.55 * Math.sin(timestamp * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 220, 255, ${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}


console.log(
  '%c< Sarannya Jana Biswas | Portfolio />',
  'color:#52d7a7; font-family:monospace; font-size:13px;'
);