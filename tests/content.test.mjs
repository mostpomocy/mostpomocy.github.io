import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { clean, resources, visible } from "../src/lib/schema.mjs";
import { validate } from "../scripts/validate.mjs";
import YAML from "yaml";
import { z } from "zod";
const post = {
  id: "probny-artykul",
  title: "Próbny artykuł",
  slug: "probny-artykul",
  body: "<h2>Rozmowa</h2><p>Treść</p>",
  category_id: "poradniki",
  status: "published",
  published_at: "2026-01-01T12:00:00Z",
};
test("publikacja uwzględnia szkice, kosz i przyszły termin", () => {
  const now = Date.parse("2026-02-01");
  assert.equal(visible({ ...post, status: "draft" }, now), false);
  assert.equal(visible({ ...post, status: "trashed" }, now), false);
  assert.equal(
    visible({ ...post, status: "scheduled", published_at: "2027-01-01" }, now),
    false,
  );
  assert.equal(visible({ ...post, status: "scheduled" }, now), true);
  assert.equal(visible(post, now), true);
});

test("istniejące treści przechodzą walidację identyfikatora Pages CMS", () => {
  const cms = YAML.parse(fs.readFileSync(".pages.yml", "utf8"));
  const all = validate();
  for (const collection of cms.content.filter((c) => c.type === "collection")) {
    assert.equal(collection.fields.find((f) => f.name === "id").type, "uuid");
    for (const entry of all[collection.name]) {
      assert.doesNotThrow(
        () => z.string().uuid().parse(entry.id),
        `${collection.name}: ${entry.title || entry.name}`,
      );
    }
  }
  const fresh = clean("posts", { ...post, id: undefined });
  assert.doesNotThrow(() => z.string().uuid().parse(fresh.id));
});
test("treść usuwa skrypty, obsługę zdarzeń i niebezpieczne adresy", () => {
  const p = clean("posts", {
    ...post,
    body: '<script>alert(1)</script><p onclick="alert(1)">Tekst <a href="javascript:alert(1)">link</a></p><img src="https://example.org/a.jpg" onerror="x()" alt="Opis"/>',
  });
  assert.doesNotMatch(p.body, /script|onclick|onerror/);
  assert.match(p.body, /alt="Opis"/);
});
test("podstrona nie może zająć adresu bloga lub panelu", () => {
  for (const slug of ["admin", "blog", "sosnowiec", "dostepnosc"])
    assert.throws(() => clean("pages", { ...post, slug }));
});
test("publikacja wymaga treści, kategorii i stabilnej daty", () => {
  for (const patch of [
    { body: "" },
    { category_id: "" },
    { published_at: null },
    { published_at: "nie-data" },
  ])
    assert.throws(() => clean("posts", { ...post, ...patch }));
  assert.throws(() =>
    clean("posts", { ...post, status: "scheduled", published_at: null }),
  );
  assert.equal(
    clean("posts", { ...post, status: "draft", body: "", published_at: null })
      .status,
    "draft",
  );
});
test("walidator wykrywa zerwane relacje i powtarzające się adresy", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mostpomocy-test-"));
  try {
    for (const r of resources)
      fs.mkdirSync(path.join(root, "content", r), { recursive: true });
    fs.writeFileSync(
      path.join(root, "content/posts/probny-artykul.json"),
      JSON.stringify(clean("posts", post)),
    );
    assert.throws(() => validate(root), /Nieznana kategoria/);
    fs.writeFileSync(
      path.join(root, "content/categories/poradniki.json"),
      JSON.stringify({ id: "poradniki", name: "Poradniki", slug: "poradniki" }),
    );
    assert.doesNotThrow(() => validate(root));
    fs.writeFileSync(
      path.join(root, "content/categories/drugi.json"),
      JSON.stringify({ id: "drugi", name: "Drugie", slug: "poradniki" }),
    );
    assert.throws(() => validate(root), /Powtórzony URL/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("cała aktualna zawartość jest poprawna", () => {
  const all = validate();
  assert.equal(all.settings[0].repository, "mostpomocy/mostpomocy.github.io");
  assert.ok(all.tags.length >= 8);
  assert.ok(all.pages.length >= 4);
});
test("Pages CMS ma kolekcje podstron i tagów oraz poprawne wartości wyboru", () => {
  const cms = YAML.parse(fs.readFileSync(".pages.yml", "utf8"));
  for (const name of ["posts", "pages", "tags", "categories", "places"])
    assert.ok(cms.content.find((c) => c.name === name));
  for (const c of cms.content)
    for (const f of c.fields)
      if (f.type === "select")
        for (const v of f.options.values) assert.ok(v.name && v.label);
  assert.equal(
    cms.content
      .find((c) => c.name === "posts")
      .fields.find((f) => f.name === "tags").options.multiple,
    true,
  );
});

test("podstrony ogólne i lokalne mają osobne adresy, ale nie zajmują tras systemowych", () => {
  assert.equal(
    clean("pages", { ...post, section: "sosnowiec", slug: "przemoc" }).section,
    "sosnowiec",
  );
  for (const slug of ["blog", "kategorie", "bez-stygmy"])
    assert.throws(() =>
      clean("pages", { ...post, section: "sosnowiec", slug }),
    );
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mostpomocy-pages-"));
  try {
    for (const r of resources)
      fs.mkdirSync(path.join(root, "content", r), { recursive: true });
    for (const [id, section] of [
      ["root", "general"],
      ["local", "sosnowiec"],
    ])
      fs.writeFileSync(
        path.join(root, "content/pages", id + ".json"),
        JSON.stringify(
          clean("pages", { ...post, id, section, slug: "kontakt" }),
        ),
      );
    assert.doesNotThrow(() => validate(root));
    fs.writeFileSync(
      path.join(root, "content/pages/collision.json"),
      JSON.stringify(
        clean("pages", {
          ...post,
          id: "collision",
          section: "sosnowiec",
          slug: "kontakt",
        }),
      ),
    );
    assert.throws(() => validate(root), /Powtórzony URL/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("redakcja zachowuje projekt i obsługuje lokalne podstrony oraz relacje", () => {
  const all = validate();
  assert.equal(
    all.pages.find((p) => p.slug === "sosnowiec-bez-stygmy").noindex,
    false,
  );
  assert.ok(
    all.pages.some((p) => p.section === "sosnowiec" && p.slug === "przemoc"),
  );
  const cms = YAML.parse(fs.readFileSync(".pages.yml", "utf8"));
  assert.ok(cms.content.some((c) => c.name === "local_categories"));
  assert.ok(
    cms.content
      .find((c) => c.name === "pages")
      .fields.some((f) => f.name === "section"),
  );
  const ref = cms.content
    .find((c) => c.name === "posts")
    .fields.find((f) => f.name === "local_category_id");
  assert.equal(ref.options.value, "{fields.id}");
  assert.equal(ref.options.label, "{fields.name}");
});
test("CMS odczytuje i zapisuje daty ISO bez resetowania terminu publikacji", () => {
  const cms = YAML.parse(fs.readFileSync(".pages.yml", "utf8"));
  for (const name of ["posts", "pages"]) {
    for (const key of ["published_at", "updated_at"])
      assert.equal(
        cms.content
          .find((c) => c.name === name)
          .fields.find((f) => f.name === key).options.format,
        "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
      );
    for (const file of fs.readdirSync(`content/${name}`)) {
      const entry = JSON.parse(
        fs.readFileSync(`content/${name}/${file}`, "utf8"),
      );
      for (const key of ["published_at", "updated_at"])
        if (entry[key])
          assert.equal(entry[key], new Date(entry[key]).toISOString());
    }
  }
});

test("kafelki nie przyjmują skryptów ani zewnętrznych adresów bez HTTPS", () => {
  for (const url of [
    "javascript:alert(1)",
    "//example.org",
    "http://example.org",
  ])
    assert.throws(() =>
      clean("posts", { ...post, tiles: [{ title: "Test", url }] }),
    );
  assert.equal(
    clean("posts", {
      ...post,
      tiles: [{ title: "Wizyta", url: "/moja-kartka/" }],
    }).tiles[0].url,
    "/moja-kartka/",
  );
});
test("hierarchia instytucji wykrywa cykle i pozwala na działy poza MOPS", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mostpomocy-units-"));
  try {
    for (const r of resources)
      fs.mkdirSync(path.join(root, "content", r), { recursive: true });
    const unit = (id, parent_id) => ({
      id,
      name: "Jednostka " + id,
      section: "institution",
      parent_id,
      status: "draft",
    });
    for (const d of [unit("root", ""), unit("child", "root")])
      fs.writeFileSync(
        path.join(root, "content/places", d.id + ".json"),
        JSON.stringify(d),
      );
    assert.doesNotThrow(() => validate(root));
    fs.writeFileSync(
      path.join(root, "content/places/root.json"),
      JSON.stringify(unit("root", "child")),
    );
    assert.throws(() => validate(root), /Cykl jednostek/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("konfiguracja push przyjmuje publiczny UUID i odrzuca klucz API", () => {
  const settings = JSON.parse(
    fs.readFileSync("content/settings/main.json", "utf8"),
  );
  assert.equal(
    clean("settings", { ...settings, onesignal_app_id: "" }).onesignal_app_id,
    "",
  );
  assert.equal(
    clean("settings", {
      ...settings,
      onesignal_app_id: "8c29d915-8c2a-43b7-afbc-455f9b7d9a72",
    }).onesignal_app_id,
    "8c29d915-8c2a-43b7-afbc-455f9b7d9a72",
  );
  assert.throws(() =>
    clean("settings", {
      ...settings,
      onesignal_app_id: "os_v2_app_private_key",
    }),
  );
});
