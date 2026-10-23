import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { validate } from "./validate.mjs";
import { visible } from "../src/lib/schema.mjs";
const all = validate();
let files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = path.join(dir, f.name);
    if (f.isDirectory()) walk(name);
    else if (name.endsWith(".html")) files.push(name);
  }
}
walk("dist");
let links = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /<html[^>]*lang="pl"/);
  assert.match(html, /<title>/);
  assert.match(html, /<link[^>]*rel="canonical"/);
  for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const url = match[1];
    const dest = path.join("dist", decodeURIComponent(url));
    assert.ok(
      fs.existsSync(dest) ||
        fs.existsSync(path.join(dest, "index.html")) ||
        fs.existsSync(dest + ".html"),
      `${file}: brak ${url}`,
    );
    links++;
  }
  for (const data of html.matchAll(
    /<script type="application\/ld\+json">(.*?)<\/script>/gs,
  ))
    assert.doesNotThrow(() => JSON.parse(data[1]));
}
for (const f of [
  "sitemap.xml",
  "feed.xml",
  "robots.txt",
  "llms.txt",
  "CNAME",
  "404.html",
])
  assert.ok(fs.existsSync("dist/" + f));
assert.ok(!fs.existsSync("dist/api"));
const map = fs.readFileSync("dist/sitemap.xml", "utf8");
assert.doesNotMatch(map, /\/admin\//);
const sitemapURLs = Array.from(
  map.matchAll(/<loc>([^<]+)<\/loc>/g),
  (m) => m[1],
);
assert.equal(
  sitemapURLs.length,
  new Set(sitemapURLs).size,
  "Powtórzony adres w mapie",
);
for (const address of sitemapURLs) {
  const url = new URL(address);
  assert.equal(url.origin, new URL(all.settings[0].site_url).origin);
  assert.equal(url.protocol, "https:");
  const destination = path.join(
    "dist",
    decodeURIComponent(url.pathname),
    "index.html",
  );
  assert.ok(
    fs.existsSync(destination),
    `Mapa wskazuje brakującą stronę: ${address}`,
  );
  const html = fs.readFileSync(destination, "utf8");
  assert.ok(
    html.includes(`<link rel="canonical" href="${address}">`),
    `Mapa wskazuje inny adres niż canonical: ${address}`,
  );
  assert.doesNotMatch(html, /content="noindex/, address);
}
assert.ok(
  !sitemapURLs.some((address) => new URL(address).pathname === "/bez-stygmy/"),
);
assert.match(
  fs.readFileSync("dist/robots.txt", "utf8"),
  /Sitemap: https:\/\/mostpomocy\.pl\/sitemap\.xml/,
);

for (const post of all.posts) {
  const exists = fs.existsSync(`dist/artykuly/${post.slug}/index.html`);
  assert.equal(exists, visible(post), post.slug);
}
assert.match(
  fs.readFileSync("dist/admin/index.html", "utf8"),
  /app\.pagescms\.org/,
);
console.log(
  `Sprawdzono ${files.length} stron HTML, ${links} odnośników lokalnych, dane JSON-LD, mapę i wykluczenie szkiców.`,
);
assert.match(map, /https:\/\/mostpomocy\.pl\/sosnowiec-bez-stygmy\//);
assert.match(map, /https:\/\/mostpomocy\.pl\/sosnowiec\/przemoc\//);
const archive = fs.readFileSync("dist/sosnowiec-bez-stygmy/index.html", "utf8");
assert.doesNotMatch(archive, /content="noindex/);
assert.match(
  fs.readFileSync("dist/bez-stygmy/index.html", "utf8"),
  /http-equiv="refresh"/,
);
for (const page of all.pages) {
  const target = `dist/${page.section === "sosnowiec" ? "sosnowiec/" : ""}${page.slug}/index.html`;
  assert.equal(fs.existsSync(target), visible(page), target);
}

const manifest = JSON.parse(
  fs.readFileSync("dist/manifest.webmanifest", "utf8"),
);
for (const icon of manifest.icons)
  assert.ok(fs.existsSync(path.join("dist", icon.src)));
for (const post of all.posts.filter((p) => visible(p))) {
  const html = fs.readFileSync(`dist/artykuly/${post.slug}/index.html`, "utf8");
  assert.ok(post.seo_title && post.seo_description, `Brak SEO: ${post.title}`);
  assert.match(html, /<meta property="og:image" content="https:\/\//);
  assert.ok(fs.existsSync(`dist/og/${post.slug}.png`));
  if (post.tiles.length) assert.match(html, /class="content-tile"/);
}
assert.ok(fs.existsSync("dist/sw.js"));
console.log(
  "Sprawdzono też SEO, obrazy udostępniania, kafelki i manifest PWA.",
);

for (const file of files)
  assert.doesNotMatch(
    fs.readFileSync(file, "utf8"),
    /cdn\.onesignal\.com|OneSignalSDK\.page/,
    "Publiczna strona nie może ładować dawnego dostawcy push",
  );
for (const page of [
  "aplikacja",
  "szukaj",
  "nowosci",
  "zapisane",
  "wydarzenia",
  "galeria",
  "do-pobrania",
])
  assert.ok(fs.existsSync(`dist/${page}/index.html`));
