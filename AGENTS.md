## Cursor Cloud specific instructions

This is a plain static HTML/CSS/JS portfolio website with **no build step, no package manager, and no dependencies to install**.

### Running the dev server

Serve the site with any static HTTP server from the repo root. An HTTP server is required (not `file://`) because `js/script.js` uses ES module `export` syntax:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

### Pages

- `index.html` — Home / hero section
- `portraits.html` — Photography gallery (loads data from `data/portraits.json`)
- `about.html` — About / skills
- `contact.html` — Contact form (client-side validation; submits to Formspree)

### Notes

- There are no automated tests, no linter config, and no CI pipeline in this repo.
- External CDN resources (Bootstrap Icons, Flatpickr) require internet access; without them icons and the date picker won't render but the site is otherwise functional.
- The contact form POSTs to a Formspree endpoint — form validation can be tested locally but actual submission requires internet and a valid Formspree key.
- Likes are stored in `localStorage` (browser-only, no backend).
