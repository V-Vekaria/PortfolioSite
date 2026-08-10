# Portfolio Redesign — Editorial Hero + Bento Body

**Date:** 2026-08-10
**Status:** Approved design, pending spec review
**Direction:** A + B from the direction study (Editorial Dark hero, Bento Grid body)

## Goal

Rebuild the visual layer of the existing four-page static portfolio so it reads as a
deliberate editorial site rather than a dark framework template, while keeping it fast,
static, and easy for a recruiter to scan.

Two problems drive this:

1. **No hierarchy.** Every block on the current site carries equal visual weight — three
   proof cards, three project cards, five skill groups. The eye has nowhere to land.
2. **No presence.** There is no image of Vishnu anywhere, and no display typeface. Every
   reference in his saved collections has both.

## Non-goals

- No framework, build step, or JS bundler. It stays hand-written static HTML/CSS/JS.
- No CMS, no blog, no dark/light toggle. The site commits to one dark world.
- No 3D, no preloader, no page-transition library.
- Not rewriting project *facts* — only their presentation and framing.

## Design tokens

### Colour

The palette comes from two boards Vishnu saved: "Violet Dusk" and "Luxury Brand Palette".
The existing neon violet `#8b5cf6` is removed entirely.

| Token | Value | Role |
|---|---|---|
| `--ground` | `#0E0B10` | Page background, near-black with a plum bias |
| `--ground-2` | `#17121B` | Panel / bento tile background |
| `--ground-3` | `#221A28` | Raised tile, hover state |
| `--gold` | `#C9A227` | **The single accent.** Rules, labels, active nav, primary CTA |
| `--plum` | `#502D55` | Deep tone for gradients and the featured tile only — never an accent |
| `--cream` | `#F6DBC0` | Warm highlight, hover text |
| `--ink` | `#EDE4D6` | Body text, warm off-white |
| `--ink-soft` | `#A2968D` | Secondary text |
| `--rule` | `rgba(201,162,39,.18)` | Hairlines |

Semantic colours stay separate from the accent: `--live #7FD8A4` for shipped/available
status, `--wip #E8C87A` for in-progress. These are the only non-accent hues on the site.

### Type

Self-hosted `woff2` in `/fonts` — no CDN, no external stylesheet, no silent fallback.
(The current CSS asks for `Inter` but never loads it, so today the site silently falls
back to Segoe UI.)

| Role | Face | Use |
|---|---|---|
| Display | **Instrument Serif** | The hero wordmark, section headings, featured tile title |
| Body | **Geist Sans** | Paragraphs, tile copy |
| Utility | **Geist Mono** | Eyebrows, labels, stats, tech chips, status |

Type scale (1.25 ratio): `0.72 / 0.82 / 0.94 / 1 / 1.25 / 1.6 / 2.4 / 4.2rem`, plus the
hero wordmark which is fluid `clamp(4rem, 17vw, 15rem)`.

Running text caps at 68ch. Headings get `text-wrap: balance`. Uppercase mono labels get
`0.13em` letter-spacing.

### Layout

Single content column at `min(100% - 2rem, 1120px)`. Sibling groups use flex/grid with
`gap` — no per-element margins.

## Page designs

### index.html — the showcase

**Hero (direction A).** Full-viewport, in four layers:

1. A thin gold-ruled ticker strip: `London · backend & full-stack · open to junior roles · full-time from Sep 2026`
2. Minimal nav — name left, three links plus a gold outlined "Let's talk" pill right
3. The wordmark `VEKARIA` set in Instrument Serif, transparent fill with a `1px` gold
   stroke, centred and oversized
4. The portrait, masked to an arch (rounded top, flat bottom), sitting in front of the
   wordmark so it interrupts the letterforms

Flanking the portrait at the bottom: a role label plus a two-sentence positioning
paragraph on the left; three stat tiles on the right.

**The stat tiles must carry verifiable numbers.** The mockup used placeholders. Only
figures Vishnu confirms or that can be counted from the repos ship — for example
`Sep 2026` (graduation), `4` (projects with public repos), `2` (deployed and live). If a
figure cannot be stood behind in an interview, the tile is cut rather than filled.

**Body (direction B).** A four-column bento grid of unequal tiles, in this order:

| Tile | Span | Content |
|---|---|---|
| Featured | 2×2 | PersonaPage — title in display serif, one-line pitch, live thumbnail, link to the Vercel deploy |
| Identity | 1×2 | Photo crop, "London", name |
| Status | 1×1 | Green dot, "Open to work", "Full-time from Sep 2026" |
| Repos | 1×1 | Tabular-nums count, read from Vishnu's public GitHub at build time or hardcoded once verified — not invented |
| Stack | 1×1 | Mono chips |
| Final year project | 2×1 | Title plus one-line framing, two chips |
| Now building | 1×1 | Cloud-native multimedia platform, amber in-progress dot |
| Elsewhere | 1×1 | GitHub, LinkedIn |

Below the grid: a short "what I'm looking for" band and the contact CTA. The five
equal-weight skill groups collapse into the single Stack tile.

### projects.html

Same bento language, one tile per project at full width, each expanded into a short case
study: **Context → What I built → Decision I made → Stack**. The "Decision" line is the
differentiator — one real trade-off per project, in plain language.

### about.html

Editorial two-column: portrait left, prose right. Keeps the existing bio content but adds
one genuinely human paragraph (see Copy below). Skills render as mono chips, not cards.

### contact.html

Unchanged in behaviour — the Formspree endpoint (`xeorkqkl`), the field set, and the
success/error popup all stay. Restyled to the new tokens: gold focus rings, mono labels,
hairline field borders.

## The one signature interaction

Exactly one, per the benchmark finding that a single well-executed idea beats scattered
effects.

**The hero wordmark and portrait move at different rates.** On load the ticker fades in,
the wordmark's gold stroke draws itself, then the portrait rises into place from below. On
scroll the wordmark drifts upward faster than the portrait, so the letterforms slide behind
the photo and out of frame.

Implemented with CSS transforms driven by a single scroll listener (`requestAnimationFrame`
throttled). Fully disabled under `prefers-reduced-motion: reduce`, where everything renders
in its final position immediately.

Nothing else on the site animates beyond hover and focus states, and the existing
`.reveal` fade-in.

## Assets

**The portrait is a hard dependency of the hero.**

**Selected: `D:\Vishnu\Image\HITU0589.JPG`** (6000×4000). Chosen from ~13 sampled across
`D:\Vishnu\Engagement` and `D:\Vishnu\Image`. It is the only one that meets the brief:
solo, upper body, smart-casual (checked shirt and dark jacket), relaxed expression, eyes to
camera, and — critically — a **plain dark grey backdrop** that composites onto the
near-black hero ground with no cut-out needed, just a gradient scrim.

Processing required: crop to portrait above the horizontal curtain skirt at the bottom of
frame, keep the subject off-centre so the wordmark reads either side, downscale to ~1600px
tall, export `img/portrait.jpg` plus a `.webp` sibling. The backdrop has a faint vertical
seam to the subject's left; a tight crop removes it.

Ranked alternates, if this one is rejected:

1. `Image/WhatsApp Image 2024-03-25 at 9.22.05 PM.jpeg` — clean upper body, eyes to camera,
   plain wall, but ceremonial attire
2. `Engagement/IMG_2495.JPG` — good framing, but sunglasses hide the eyes
3. `Engagement/IMG_2494.JPG` — good background, full-length, needs 90° rotation

Rejected: all `IS2_*` group shots, which contain other adults and a child. No third party
appears on the site.

Tooling: no ImageMagick is available on this machine, and the `convert` on `PATH` is
Windows' FAT-to-NTFS utility. Cropping is done either by Vishnu manually or by adding
`sharp` as a devDependency — his call.

**Fallback if no photo is supplied:** the arch renders as a plum-to-black gradient plate
carrying the initials `VV` in Instrument Serif. The hero must never look broken or show an
empty box, so this fallback ships regardless and is simply overridden when the photo lands.

## Copy changes

The hero paragraph drops from four lines to two. Beyond that:

- **One decision paragraph per project** on projects.html, drafted from the existing repos
  and confirmed by Vishnu before publishing. Nothing invented.
- **One human detail** on about.html. The Sainsbury's supervisor role — running a team of
  5–8 while doing a full-time CS degree — is real, specific, and says more about him than
  "practical, credible, still learning". Subject to his approval.

Any claim I cannot verify from the repo or from Vishnu directly does not go on the site.

## Removals

| Removing | Why |
|---|---|
| `#particleCanvas` and its ~70 lines of JS | Hardcoded to the violet accent; reads as generic dark-tech template |
| `.cursor-glow` and its listener | Same, plus it fights the one signature interaction |
| Bootstrap Icons CDN `<link>` | An external stylesheet for ~10 glyphs; replaced with an inline SVG sprite |
| `getLikes` / `like` exports in `script.js` | Dead code — nothing imports or calls them |
| The three "proof cards" and five skill groups | Absorbed into the bento grid |

## File structure

```
css/style.css        rewritten around the new tokens
js/script.js         nav + reveal kept; particles, cursor glow, likes removed;
                     hero parallax added
fonts/               instrument-serif, geist-sans, geist-mono (woff2)
img/portrait.jpg     supplied by Vishnu; .webp sibling generated
index.html           hero + bento
projects.html        case-study tiles
about.html           editorial two-column
contact.html         restyled, behaviour untouched
```

`scripts/validate-static-site.cjs` must still pass — it is the project's only build step.

## Success criteria

1. No `#8b5cf6` or any neon violet remains in the codebase.
2. Three typefaces load from `/fonts`; no external stylesheet or font CDN is referenced.
3. On index.html the hero wordmark is the largest element on the page by a wide margin,
   and the featured project tile is visibly larger than every other tile.
4. A first-time visitor can identify role, location, availability, stack, and best project
   without scrolling past the bento grid.
5. Every project on projects.html carries one decision sentence.
6. `prefers-reduced-motion: reduce` disables the parallax and load sequence entirely.
7. Keyboard focus is visible on every interactive element; the contact form still submits
   to Formspree and still shows its success and error states.
8. The site works with `/img/portrait.jpg` absent.
9. `npm run build` passes.
10. Every number on the site — stat tiles, repo counts, years — is one Vishnu has
    confirmed. No placeholder figures survive into a commit.

## Open questions

1. **Crop tooling** — add `sharp` as a devDependency so the crop is scripted and
   reproducible, or Vishnu crops `HITU0589.JPG` by hand and drops the result in `img/`.
2. **Stat tile figures** — which numbers Vishnu will stand behind (see the hero section).
