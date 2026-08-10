/**
 * Portrait pipeline — two slots, no manual editing ever.
 *
 *   img/portrait-source.*        → img/portrait.webp       hero figure
 *   img/portrait-face-source.*   → img/portrait-face.webp  bento tile + About
 *
 * If no face source is supplied, the hero image is reused for both, so the
 * pages always have something to load.
 *
 * Background handling is automatic. A source may be:
 *   - a true transparent PNG                       → used as-is
 *   - a cut-out flattened onto black (WhatsApp)    → black keyed back out
 *   - a photo on a plain light backdrop            → backdrop keyed out
 *   - an ordinary photo                            → face-weighted 4:5 crop
 *
 * Keying flood-fills inward from the frame edge, so background *inside* the
 * subject — the gaps in a chair back, shadow under a lapel — stays opaque.
 *
 * Flags:  --full   keep whole figures instead of cropping to a bust
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const imgDir = path.join(root, "img");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("sharp is not installed. Run: npm install");
  process.exit(1);
}

const HERO_HEIGHT = 1800; // hero figure renders up to ~560px, so 2x retina plus headroom
const FACE_HEIGHT = 1100; // tile and About render at ~460px max
const DARK_LUMA = 26; // pixels this dark count as a black backdrop
const LIGHT_MARGIN = 45; // how far below the backdrop's own brightness still counts as backdrop
const LIGHT_FLOOR = 175; // never treat anything darker than this as a light backdrop
const BORDER_RATIO = 0.9; // share of border that must be dark before treating it as a black matte
const LIGHT_BORDER_RATIO = 0.55; // lower bar for light: a subject often runs off the bottom edge

const BUST_RATIO_TRIGGER = 1.35; // height/width above which a figure counts as full-body
const BUST_KEEP = 0.4; // share of a full-body figure's height to keep, from the top
const KEEP_FULL = process.argv.includes("--full");

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function findSource(base) {
  return [`${base}.png`, `${base}.jpg`, `${base}.jpeg`]
    .map((name) => path.join(imgDir, name))
    .find(fs.existsSync);
}

/** Walk the 1px border and describe it: how dark, how light, how bright on average. */
function borderStats(data, width, height, channels) {
  const values = [];
  const at = (x, y) => (y * width + x) * channels;
  const sample = (x, y) => {
    const i = at(x, y);
    values.push(luma(data[i], data[i + 1], data[i + 2]));
  };
  for (let x = 0; x < width; x += 1) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    sample(0, y);
    sample(width - 1, y);
  }
  values.sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];
  const dark = values.filter((v) => v <= DARK_LUMA).length / values.length;

  // A head-and-shoulders shot runs off the bottom of the frame, so part of the
  // border is subject, not backdrop. Take the brightness of the *upper* half of
  // border values as the backdrop reading rather than the overall median.
  const backdrop = values[Math.floor(values.length * 0.75)];
  const lightThreshold = Math.max(LIGHT_FLOOR, backdrop - LIGHT_MARGIN);
  const light = values.filter((v) => v >= lightThreshold).length / values.length;
  return { median, backdrop, dark, light, lightThreshold };
}

/** Flood-fill backdrop inward from every border pixel. */
function keyBackground(data, width, height, channels, isBackdrop) {
  const alpha = Buffer.alloc(width * height, 255);
  const seen = new Uint8Array(width * height);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p]) return;
    const i = p * channels;
    if (!isBackdrop(luma(data[i], data[i + 1], data[i + 2]))) return;
    seen[p] = 1;
    alpha[p] = 0;
    stack.push(p);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    const x = p % width;
    const y = (p - x) / width;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  let cleared = 0;
  for (const v of alpha) if (v === 0) cleared += 1;
  return { alpha, clearedRatio: cleared / (width * height) };
}

/**
 * Drop small opaque islands.
 *
 * Flood-filling from the border cannot reach backdrop that is fenced off from
 * the frame edge — a patch of wall between an arm and the crop, a panel seam in
 * a corner. Those survive as stray specks. The subject is one large connected
 * blob, so anything under `minShare` of the frame is debris and gets cleared.
 */
function dropIslands(alpha, width, height, minShare = 0.02) {
  const seen = new Uint8Array(width * height);
  const minPixels = Math.round(width * height * minShare);
  let removed = 0;

  for (let start = 0; start < width * height; start += 1) {
    if (seen[start] || alpha[start] === 0) continue;
    const blob = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop();
      blob.push(p);
      const x = p % width;
      const y = (p - x) / width;
      const nb = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1
      ];
      for (const q of nb) {
        if (q < 0 || seen[q] || alpha[q] === 0) continue;
        seen[q] = 1;
        stack.push(q);
      }
    }
    if (blob.length < minPixels) {
      for (const p of blob) alpha[p] = 0;
      removed += 1;
    }
  }
  return removed;
}

/**
 * Rejoin RGB with a feathered alpha channel.
 *
 * `erode` pulls the matte in by roughly a pixel. Needed when keying a *light*
 * backdrop: edge pixels are part subject, part backdrop, so keeping them leaves a
 * pale halo once the cut-out sits on a dark page. Black mattes need no erosion —
 * their contamination is already the page colour.
 */
async function composeAlpha(data, alpha, width, height, channels, { erode = false } = {}) {
  // blur() promotes a 1-channel raw image to 3 channels, which would corrupt the
  // stride when joined back as alpha — extractChannel forces it back to one.
  let mask = sharp(alpha, { raw: { width, height, channels: 1 } }).blur(erode ? 1.8 : 0.8);
  if (erode) mask = mask.linear(2.6, -320); // pushes partial edge coverage to zero
  const soft = await mask.extractChannel(0).raw().toBuffer();
  if (soft.length !== width * height) {
    throw new Error(`alpha stride mismatch: ${soft.length} != ${width * height}`);
  }

  const rgb = Buffer.alloc(width * height * 3);
  for (let p = 0; p < width * height; p += 1) {
    const i = p * channels;
    rgb[p * 3] = data[i];
    rgb[p * 3 + 1] = data[i + 1];
    rgb[p * 3 + 2] = data[i + 2];
  }

  return sharp(rgb, { raw: { width, height, channels: 3 } })
    .joinChannel(soft, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}

/**
 * A full-body figure renders its face far too small to carry a hero. Editorial
 * portraits are cropped waist-up, so trim tall figures to their top portion.
 */
async function bustCrop(buffer, label) {
  if (KEEP_FULL) return buffer;
  const m = await sharp(buffer).metadata();
  if (m.height / m.width <= BUST_RATIO_TRIGGER) return buffer;
  const height = Math.round(m.height * BUST_KEEP);
  console.log(`  ${label}: full-body (${m.width}x${m.height}) — cropped to bust, top ${Math.round(BUST_KEEP * 100)}%`);
  return sharp(buffer).extract({ left: 0, top: 0, width: m.width, height }).png().toBuffer();
}

/** Produce a transparent cut-out buffer from a source, or null if it isn't one. */
async function cutout(source, label) {
  const meta = await sharp(source).metadata();

  if (meta.hasAlpha) {
    console.log(`  ${label}: source already transparent`);
    return sharp(source).rotate().trim({ threshold: 1 }).png().toBuffer();
  }

  const { data, info } = await sharp(source).rotate().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const stats = borderStats(data, width, height, channels);

  let isBackdrop = null;
  let mode = null;
  let erode = false;
  if (stats.dark >= BORDER_RATIO) {
    isBackdrop = (v) => v <= DARK_LUMA;
    mode = "black matte";
  } else if (stats.light >= LIGHT_BORDER_RATIO) {
    isBackdrop = (v) => v >= stats.lightThreshold;
    mode = `light backdrop (${Math.round(stats.light * 100)}% of border, >= ${Math.round(stats.lightThreshold)} luma)`;
    erode = true;
  }

  if (!isBackdrop) {
    console.log(
      `  ${label}: no plain backdrop (border median ${Math.round(stats.median)}, ` +
        `${Math.round(stats.light * 100)}% light) — treating as photo`
    );
    return null;
  }

  const { alpha, clearedRatio } = keyBackground(data, width, height, channels, isBackdrop);

  /* Sanity check before we trust the matte. A light backdrop plus light clothing
     (white shirt against a white wall) lets the fill walk straight through the
     subject and hollow them out. The subject always occupies the middle of the
     frame, so if much of the centre came out transparent the key is wrong —
     fall back to treating it as an ordinary photo rather than shipping a hole. */
  const cx0 = Math.round(width * 0.35);
  const cx1 = Math.round(width * 0.65);
  const cy0 = Math.round(height * 0.2);
  const cy1 = Math.round(height * 0.7);
  let centreTotal = 0;
  let centreClear = 0;
  for (let y = cy0; y < cy1; y += 2) {
    for (let x = cx0; x < cx1; x += 2) {
      centreTotal += 1;
      if (alpha[y * width + x] === 0) centreClear += 1;
    }
  }
  const centreLoss = centreClear / centreTotal;
  if (centreLoss > 0.25) {
    console.log(
      `  ${label}: ${mode} rejected — it cleared ${(centreLoss * 100).toFixed(0)}% of the subject area ` +
        `(light clothing on a light backdrop). Treating as photo.`
    );
    return null;
  }

  const islands = dropIslands(alpha, width, height);
  console.log(
    `  ${label}: ${mode} keyed — ${(clearedRatio * 100).toFixed(0)}% of frame cleared` +
      (islands ? `, ${islands} stray island${islands > 1 ? "s" : ""} removed` : "")
  );
  const keyed = await composeAlpha(data, alpha, width, height, channels, { erode });
  return sharp(keyed).trim({ threshold: 1 }).png().toBuffer();
}

async function processSlot({ base, out, label, bust, height }) {
  const source = findSource(base);
  if (!source) return false;

  const cut = await cutout(source, label);

  if (cut) {
    const framed = bust ? await bustCrop(cut, label) : cut;
    // WebP only — it is what the pages load, and it carries alpha. A PNG of the
    // same figure is ~10x the bytes for no benefit.
    const pipeline = sharp(framed).resize({ height, fit: "inside", withoutEnlargement: true });
    await pipeline.clone().webp({ quality: 88, alphaQuality: 100 }).toFile(path.join(imgDir, `${out}.webp`));
    const m = await sharp(path.join(imgDir, `${out}.webp`)).metadata();
    const { size } = fs.statSync(path.join(imgDir, `${out}.webp`));
    console.log(`  ${label}: wrote ${out}.webp (${m.width}x${m.height}, ${(size / 1024).toFixed(0)} KB)`);
    return true;
  }

  // Opaque photo with a busy background — no keying possible, so crop to 4:5
  // around the face. Bust-crop first: on a full-length shot the 4:5 window would
  // otherwise take in whatever is behind and below the subject.
  const rotated = await sharp(source).rotate().png().toBuffer();
  const framed = bust ? await bustCrop(rotated, label) : rotated;
  const width = Math.round((height * 4) / 5);
  const pipeline = sharp(framed).resize(width, height, {
    fit: "cover",
    position: sharp.strategy.attention
  });
  await pipeline.clone().webp({ quality: 82 }).toFile(path.join(imgDir, `${out}.webp`));
  console.log(`  ${label}: wrote ${out}.webp (photo, ${width}x${height})`);
  return true;
}

(async () => {
  const hero = await processSlot({
    base: "portrait-source",
    out: "portrait",
    label: "hero",
    bust: true,
    height: HERO_HEIGHT,
  });
  if (!hero) {
    console.log("No img/portrait-source.* found — keeping existing outputs.");
    return;
  }

  const face = await processSlot({
    base: "portrait-face-source",
    out: "portrait-face",
    label: "face",
    bust: true,
    height: FACE_HEIGHT,
  });

  if (!face) {
    // Pages always reference portrait-face.webp, so give them the hero image.
    fs.copyFileSync(path.join(imgDir, "portrait.webp"), path.join(imgDir, "portrait-face.webp"));
    console.log("  face: no portrait-face-source.* — reusing the hero image");
  }
})();
