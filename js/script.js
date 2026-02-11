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

