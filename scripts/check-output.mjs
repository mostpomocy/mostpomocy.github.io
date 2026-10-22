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
