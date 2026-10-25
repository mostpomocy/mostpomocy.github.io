import test from "node:test";
import assert from "node:assert/strict";
import {
  safeDestination,
  campaignFromSearch,
} from "../src/lib/short-links.mjs";
import { clean } from "../src/lib/schema.mjs";
test("krótkie linki przyjmują zewnętrzne HTTPS i zachowują parametry celu", () => {
  assert.equal(
    safeDestination(
      "https://www.mopssosnowiec.pl/wolontariat.html?x=1#kontakt",
    ),
    "https://www.mopssosnowiec.pl/wolontariat.html?x=1#kontakt",
  );
  assert.equal(
    safeDestination("/sosnowiec/"),
    "https://mostpomocy.pl/sosnowiec/",
  );
  for (const value of [
    "javascript:alert(1)",
    "//evil.example",
    "http://example.com",
    "https://user:password@example.com",
    "https://mostpomocy.pl/l/petla/",
    "",
  ])
    assert.throws(() => safeDestination(value));
});
test("link ma stały krótki adres mimo zmiany celu i bezpieczne oznaczenia", () => {
  const link = {
    name: "Przykładowy link",
    slug: "ulotka-mops",
    target_url: "https://example.com",
    source: "mops",
    medium: "qr",
    campaign: "jesien_2026",
    status: "published",
  };
  assert.equal(
    clean("links", link).slug,
    clean("links", { ...link, target_url: "https://example.org" }).slug,
  );
  assert.throws(() =>
    clean("links", { ...link, source: "dane osoby@example.com" }),
  );
  assert.throws(() =>
    clean("links", { ...link, target_url: "javascript:alert(1)" }),
  );
});
test("zdarzenie otwarcia odczytuje etykiety QR bez zależności od źródła sesji", () => {
  assert.deepEqual(
    campaignFromSearch(
      "?utm_source=mops&utm_medium=qr&utm_campaign=jesien&utm_content=plakat-1",
    ),
    { code: "plakat-1", source: "mops", medium: "qr", campaign: "jesien" },
  );
  assert.equal(campaignFromSearch("?utm_medium=qr"), null);
  assert.equal(
    campaignFromSearch(
      "?utm_medium=email&utm_content=1&utm_source=1&utm_campaign=1",
    ),
    null,
  );
});
