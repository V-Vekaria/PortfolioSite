# Vishnu Vekaria — Developer Portfolio

Personal portfolio website built from scratch — no frameworks, no templates. A fully interactive CS developer site with particle animations, 3D effects, and scroll-driven experiences.

**Live site → [vishnupro.netlify.app](https://vishnupro.netlify.app)**

---

## Pages

| Page | Description |
|---|---|
| **Home** | Hero with typewriter animation, interactive 3D code card, particle background |
| **Projects** | Glassmorphism cards with hover lift — SaaS API, Azure platform, security dissertation, this site |
| **About** | Animated skill bars, stat counters (4+ projects / 3rd year / Sep '26), profile card |
| **Contact** | Validated contact form with Formspree — live sending state and success feedback |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, backdrop-filter, keyframe animations) |
| Interactivity | Vanilla JavaScript (Canvas API, IntersectionObserver, ES modules) |
| Form handling | Formspree |
| Version control | Git + GitHub |
| Hosting | Netlify (continuous deployment on push to `main`) |

---

## Interactive Features

- **Particle network** — 60-particle canvas, mouse-reactive connections, hidden on touch devices
- **Typewriter hero** — JS character-by-character reveal with blinking cursor
- **3D code card** — perspective tilt + radial glow that follows the mouse
- **Glassmorphism project cards** — `backdrop-filter` blur with lift and border glow on hover
- **Scroll reveal** — IntersectionObserver fades every card and section into view
- **Animated stat counters** — numbers count up when scrolled into view
- **Animated skill bars** — progress bars slide in on scroll (About page)
- **Cursor glow** — subtle radial gradient that follows the pointer
- **In-progress badge pulse** — animated dot on active project badges
- **Contact form states** — input focus glow, "Sending…" → "✓ Sent!" button feedback

---

## Run Locally

No build step — plain HTML/CSS/JS.

```bash
git clone https://github.com/V-Vekaria/PortfolioSite.git
cd PortfolioSite
start index.html   # Windows
open index.html    # macOS
```

---

## Project Structure

```
PortfolioSite/
├── index.html        # Home — hero, typewriter, 3D code card
├── projects.html     # Projects — glassmorphism cards
├── about.html        # About — skill bars, stat counters
├── contact.html      # Contact — validated form + Formspree
├── css/
│   └── style.css     # All styles including animations and upgrades
└── js/
    └── script.js     # Particles, tilt, reveal, counters, typewriter
```

---

## Author

**Vishnu Vekaria** — BSc (Hons) Computer Science, Ulster University London (Sep 2026)  
[github.com/V-Vekaria](https://github.com/V-Vekaria) · [linkedin.com/in/vekaria-vishnu](https://www.linkedin.com/in/vekaria-vishnu/) · [vishnupro.netlify.app](https://vishnupro.netlify.app)
