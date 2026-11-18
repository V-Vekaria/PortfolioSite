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

// ---------- home: soft spotlight that follows the cursor (mouse/trackpad only) ----------
(function initSpotlight() {
  const spot = document.querySelector(".spotlight");
  if (!spot || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener(
    "pointermove",
    (e) => {
      spot.style.setProperty("--x", `${e.clientX}px`);
      spot.style.setProperty("--y", `${e.clientY}px`);
    },
    { passive: true }
  );
})();

// ---------- home: highlight the sidebar link for the section in view ----------
(function initSectionNav() {
  const links = [...document.querySelectorAll(".side-nav a")];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) =>
    links.forEach((link) => {
      const on = link.hash === `#${id}`;
      link.classList.toggle("active", on);
      on ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current");
    });

  // Current = the last section whose top has passed the middle of the screen; at the very
  // bottom it's the last section, which may be too short to ever reach the middle.
  // (An IntersectionObserver band missed sections on fast scrolls and in the gaps.)
  let ticking = false;
  const update = () => {
    ticking = false;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight / 2) current = s;
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    setActive((atBottom ? sections[sections.length - 1] : current).id);
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) (ticking = true), requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
})();

// ---------- home: extrude the social icons into 3D ----------
// Stacks darker copies of each icon behind it so the tilt shows real depth.
// Without JS the plain flat icon stays, so nothing is lost.
(function extrudeIcons() {
  const depth = ["#7a5a84", "#6a4c74", "#5c4166", "#4f3759", "#432e4c", "#38263f"];
  document.querySelectorAll(".social svg").forEach((svg) => {
    const box = document.createElement("span");
    box.className = "ico3d";
    svg.replaceWith(box);
    depth.forEach((color, i) => {
      const layer = svg.cloneNode(true);
      layer.classList.add("layer");
      layer.style.color = color;
      layer.style.transform = `translateZ(${-(i + 1) * 0.8}px)`;
      box.append(layer);
    });
    box.append(svg); // the real icon goes last, at the front
  });
})();

// ---------- home: corner camera goes back to the top ----------
document.getElementById("toTop")?.addEventListener("click", () => {
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // focusing anything mid smooth-scroll cancels it in Chrome, so move keyboard
  // focus to the name only once the scroll has finished (no scrollend = no move)
  const name = document.querySelector(".side h1 a");
  window.addEventListener("scrollend", () => name?.focus({ preventScroll: true }), { once: true });
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
});
