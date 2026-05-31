const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("navOverlay");

function openMenu() {
  if (!mobileMenu) return;
  mobileMenu.hidden = false;
  requestAnimationFrame(() => mobileMenu.classList.add("show"));
  if (overlay) overlay.hidden = false;
  document.body.classList.add("nav-open");
  menuBtn?.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("show");
  window.setTimeout(() => {
    if (!mobileMenu.classList.contains("show")) mobileMenu.hidden = true;
  }, 240);
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("nav-open");
  menuBtn?.setAttribute("aria-expanded", "false");
}

menuBtn?.addEventListener("click", () => {
  const expanded = menuBtn.getAttribute("aria-expanded") === "true";
  expanded ? closeMenu() : openMenu();
});

overlay?.addEventListener("click", closeMenu);
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 720) closeMenu();
});

(function markActive() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === path);
  });
})();

(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  items.forEach((item) => observer.observe(item));
})();

(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas || window.matchMedia("(pointer: coarse)").matches) return;

  const ctx = canvas.getContext("2d");
  const particles = [];
  const count = 34;
  const connectionDistance = 135;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.size = Math.random() * 1.4 + 0.6;
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
      ctx.fillStyle = "rgba(139, 92, 246, 0.22)";
      ctx.fill();
    }
  }

  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < count; i += 1) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.07 * (1 - distance / connectionDistance)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
})();

(function initCursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || window.matchMedia("(pointer: coarse)").matches) return;

  window.addEventListener("mousemove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
})();

export function getLikes(id) {
  return Number(localStorage.getItem(`likes:${id}`) || 0);
}

export function like(id) {
  const onceKey = `liked-once:${id}`;
  if (localStorage.getItem(onceKey)) return getLikes(id);
  const key = `likes:${id}`;
  const nextValue = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(nextValue));
  localStorage.setItem(onceKey, "1");
  return nextValue;
}
