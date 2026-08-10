// year stamp
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- mobile nav ----------
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("navOverlay");

function openMenu() {
  if (!mobileMenu) return;
  mobileMenu.hidden = false;
  // Flush layout so the transition has a start value to animate from. Doing this
  // in requestAnimationFrame instead would leave the menu stuck at opacity 0 in
  // any context where rAF is starved (a backgrounded tab, for one).
  void mobileMenu.offsetHeight;
  mobileMenu.classList.add("show");
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

// ---------- active nav link ----------
(function markActive() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === path);
  });
})();

// ---------- reveal on scroll ----------
(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));
})();

// ---------- header + hero scroll behaviour ----------
(function initScroll() {
  const header = document.getElementById("siteHeader");
  const wordmark = document.getElementById("wordmark");
  const portrait = document.getElementById("portrait");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroParallax =
    !reduceMotion && wordmark && portrait && window.matchMedia("(min-width: 861px)").matches;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header?.classList.toggle("scrolled", y > 40);

      // the wordmark drifts up faster than the portrait, sliding behind it
      if (heroParallax && y < window.innerHeight) {
        wordmark.style.transform = `translateY(calc(-50% - ${(y * 0.28).toFixed(1)}px))`;
        portrait.style.transform = `translateY(${(y * 0.1).toFixed(1)}px)`;
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
