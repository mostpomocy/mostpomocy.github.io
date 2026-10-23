import test from "node:test";
import assert from "node:assert/strict";
import { canonicalURL, searchDescription } from "../src/lib/seo.mjs";
import { clean } from "../src/lib/schema.mjs";
test("canonical usuwa parametry śledzenia i fragment, zachowując jawny oryginał", () => {
  assert.equal(
    canonicalURL("/blog/?utm_source=test#nowe", "https://mostpomocy.pl"),
    "https://mostpomocy.pl/blog/",
  );
  assert.equal(
    canonicalURL(
      "/wpis/",
      "https://mostpomocy.pl",
      "https://example.org/oryginal/",
    ),
    "https://example.org/oryginal/",
  );
});
test("opis ma czytelny skrót bez HTML i używa wprowadzenia jako wartości zapasowej", () => {
  assert.equal(
    searchDescription("", "<p>Pomoc   w Sosnowcu.</p>"),
    "Pomoc w Sosnowcu.",
  );
  assert.ok(searchDescription("Słowa ".repeat(100)).length <= 180);
});
test("pytania są opcjonalne i odrzucają pustą odpowiedź", () => {
  assert.deepEqual(
    clean("settings", {
      id: "main",
      title: "MostPomocy",
      site_url: "https://mostpomocy.pl",
      repository: "mostpomocy/mostpomocy.github.io",
    }).faq,
    [],
  );
  assert.throws(() =>
    clean("settings", {
      id: "main",
      title: "MostPomocy",
      site_url: "https://mostpomocy.pl",
      repository: "mostpomocy/mostpomocy.github.io",
      faq: [{ question: "Pytanie?", answer: "" }],
    }),
  );
});
