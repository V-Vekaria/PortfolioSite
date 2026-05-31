const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pages = ["index.html", "projects.html", "about.html", "contact.html"];
const requiredAssets = ["css/style.css", "js/script.js", "robots.txt", "sitemap.xml"];
const failures = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

for (const file of [...pages, ...requiredAssets]) {
  if (!exists(file)) failures.push(`Missing required file: ${file}`);
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const hrefs = [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]);
  const srcs = [...html.matchAll(/\bsrc=["']([^"']+)["']/g)].map((match) => match[1]);

  for (const url of [...hrefs, ...srcs]) {
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:") ||
      url.startsWith("#")
    ) {
      continue;
    }

    const target = url.split("#")[0].split("?")[0];
    if (target && !exists(target)) {
      failures.push(`${page} references missing local file: ${url}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Static site validation passed.");
