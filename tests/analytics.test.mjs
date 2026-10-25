import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { transpileModule, ModuleKind } from "typescript";
import { campaignFromSearch } from "../src/lib/short-links.mjs";
function environment(
  pathname = "/blog/",
  search = "",
  hostname = "mostpomocy.pl",
) {
  const scripts = [],
    window = {},
    exports = {};
  const source = transpileModule(
    fs.readFileSync("src/lib/analytics.ts", "utf8"),
    { compilerOptions: { module: ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    require: () => ({ campaignFromSearch }),
    window,
    location: { hostname, pathname, search },
    document: {
      createElement: () => ({}),
      head: { appendChild: (s) => scripts.push(s) },
    },
    Date,
  });
  return { scripts, window, api: exports };
}
test("GA jest inicjalizowane raz i pomija panel oraz błędny identyfikator", () => {
  const env = environment();
  assert.equal(env.api.startAnalytics("niepoprawny"), false);
  assert.equal(env.scripts.length, 0);
  env.api.startAnalytics("G-TEST123");
  env.api.startAnalytics("G-TEST123");
  assert.equal(env.scripts.length, 1);
  assert.equal(env.window.dataLayer.length, 2);
  assert.equal(environment("/admin/").api.startAnalytics("G-TEST123"), false);
  assert.equal(
    environment("/blog/", "", "127.0.0.1").api.startAnalytics("G-TEST123"),
    false,
  );
  assert.equal(
    environment("/blog/", "", "localhost").api.startAnalytics("G-TEST123"),
    false,
  );
});
test("jedno otwarcie QR wysyła jedno zdarzenie z publicznymi etykietami", () => {
  const env = environment(
    "/blog/",
    "?utm_source=mops&utm_medium=qr&utm_campaign=jesien&utm_content=plakat-1",
  );
  env.api.startAnalytics("G-TEST123");
  env.api.trackLandingCampaign();
  env.api.trackLandingCampaign();
  const events = env.window.dataLayer.filter((a) => a[0] === "event");
  assert.equal(events.length, 1);
  assert.equal(events[0][1], "campaign_open");
  assert.equal(events[0][2].link_code, "plakat-1");
  assert.equal(events[0][2].link_source, "mops");
  assert.equal(events[0][2].link_medium, "qr");
  assert.equal(events[0][2].link_campaign, "jesien");
  assert.equal(events[0][2].target_url, undefined);
});
