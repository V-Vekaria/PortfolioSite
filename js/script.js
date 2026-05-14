/* ===== Shared helpers (keep if you already have them) ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Navbar logic ===== */
const menuBtn     = document.getElementById('menuBtn');
const mobileMenu  = document.getElementById('mobileMenu');
const overlay     = document.getElementById('navOverlay');

function openMenu(){
  if (!mobileMenu) return;
  mobileMenu.hidden = false;
  // allow CSS animation to run
  requestAnimationFrame(()=> mobileMenu.classList.add('show'));
  overlay && (overlay.hidden = false);
  document.body.classList.add('nav-open');
  menuBtn?.setAttribute('aria-expanded','true');
}

function closeMenu(){
  if (!mobileMenu) return;
  mobileMenu.classList.remove('show');
  // wait for animation, then hide for a11y
  setTimeout(()=> mobileMenu.hidden = true, 250);
  overlay && (overlay.hidden = true);
  document.body.classList.remove('nav-open');
  menuBtn?.setAttribute('aria-expanded','false');
}

menuBtn?.addEventListener('click', ()=>{
  const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
  expanded ? closeMenu() : openMenu();
});

// close when clicking overlay or a link
overlay?.addEventListener('click', closeMenu);
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// close on Escape
window.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') closeMenu();
});

// close if resizing to desktop
window.addEventListener('resize', ()=>{
  if (window.innerWidth > 720) closeMenu();
});

// mark the active link based on the current page
(function markActive(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a=>{
    const href = a.getAttribute('href');
    const isActive = (href === path) || (path === '' && href === 'index.html');
    a.classList.toggle('active', isActive);
  });
})();

/* ===== UPGRADE 1: Particle Network Background ===== */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 150;
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(138, 125, 255, 0.35)';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(138, 125, 255, ${0.12 * (1 - dist / CONNECTION_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(160, 150, 255, ${0.25 * (1 - dist / 200)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ===== UPGRADE 2: 3D Tilt Code Card ===== */
(function initTilt() {
  const codeCard = document.getElementById('codeCard');
  if (!codeCard) return;
  const glow = codeCard.querySelector('.code-glow');

  codeCard.addEventListener('mousemove', (e) => {
    const rect = codeCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 20;
    const rotateY = (rect.width / 2 - x) / 20;
    codeCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    if (glow) {
      const gx = ((x / rect.width) - 0.5) * 40;
      const gy = ((y / rect.height) - 0.5) * 40;
      glow.style.background = `radial-gradient(circle at ${50 + gx}% ${50 + gy}%, #8a7dff, #764ba2, #0f0f10)`;
    }
  });

  codeCard.addEventListener('mouseleave', () => {
    codeCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  });
})();

/* ===== UPGRADE 5: Scroll Reveal ===== */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ===== UPGRADE 6: Animated Stat Counters ===== */
(function initCounters() {
  function animateCounter(el, target, suffix, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start) + suffix;
      }
    }, 16);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(
          entry.target,
          parseInt(entry.target.dataset.target),
          entry.target.dataset.suffix || '',
          2000
        );
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
})();

/* ===== UPGRADE 7: Cursor Glow ===== */
(function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();

/* ===== (Optional) simple local likes API you used earlier ===== */
export function getLikes(id){
  return Number(localStorage.getItem(`likes:${id}`) || 0);
}
export function like(id){
  const onceKey = `liked-once:${id}`;
  if (localStorage.getItem(onceKey)) return getLikes(id);
  const key = `likes:${id}`;
  const n = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(n));
  localStorage.setItem(onceKey, '1');
  return n;
}

