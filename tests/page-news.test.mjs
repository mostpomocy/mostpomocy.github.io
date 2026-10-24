import test from "node:test";
import assert from "node:assert/strict";
import { pageArticles, renderRSS } from "../src/lib/page-news.mjs";
test("dział pokazuje przypisane wpisy i lokalną kategorię bez dublowania", () => {
  const page = {
    id: "wolontariat",
    section: "sosnowiec",
    related_category_id: "vol",
  };
  const local = {
    id: "local",
    category_id: "vol",
    scope: "sosnowiec",
    related_page_ids: ["wolontariat"],
  };
  const national = { id: "national", category_id: "vol", scope: "general" };
  const assigned = {
    id: "assigned",
    category_id: "other",
    scope: "general",
    related_page_ids: ["wolontariat"],
  };
  assert.deepEqual(pageArticles(page, [local, national, assigned]), [
    local,
    assigned,
  ]);
  assert.deepEqual(
    pageArticles({ ...page, related_category_id: "" }, [
      local,
      national,
      assigned,
    ]),
    [local, assigned],
  );
});
test("RSS zachowuje adres GUID, polskie znaki i bezpieczny XML", () => {
  const xml = renderRSS({
    title: "Wolontariat & pomoc",
    site: "https://mostpomocy.pl/",
    feed: "https://mostpomocy.pl/feed.xml",
    items: [
      {
        title: "Łączy <ludzi>",
        url: "https://mostpomocy.pl/tekst/?a=1&b=2",
        description: "Opis",
        date: "2026-10-24T13:55:20Z",
      },
    ],
  });
  assert.match(xml, /Wolontariat &amp; pomoc/);
  assert.match(xml, /Łączy &lt;ludzi&gt;/);
  assert.match(
    xml,
    /<guid isPermaLink="true">https:\/\/mostpomocy.pl\/tekst\/\?a=1&amp;b=2<\/guid>/,
  );
  assert.match(xml, /<pubDate>Sat, 24 Oct 2026 13:55:20 GMT<\/pubDate>/);
});
