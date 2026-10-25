import test from "node:test";
import assert from "node:assert/strict";
import { buildQRLink, qrLabel, qrSVG } from "../src/lib/qr.mjs";
const data = {
  target: "/sosnowiec/",
  source: "MOPS Sosnowiec",
  campaign: "Jesień 2026",
  code: "plakat_01",
};
test("QR zachowuje rozróżnienie materiału i źródła oraz stałe medium", () => {
  const u = new URL(buildQRLink(data, ["/sosnowiec/"]));
  assert.equal(u.searchParams.get("utm_source"), "mops_sosnowiec");
  assert.equal(u.searchParams.get("utm_medium"), "qr");
  assert.equal(u.searchParams.get("utm_campaign"), "jesien_2026");
  assert.equal(u.searchParams.get("utm_content"), "plakat_01");
  assert.equal(qrLabel("Łódź!"), "lodz");
});
test("QR odrzuca cudze domeny, szkice i puste oznaczenia", () => {
  for (const target of [
    "https://example.org/",
    "//evil.test/",
    "/admin/",
    "javascript:alert(1)",
  ])
    assert.throws(() => buildQRLink({ ...data, target }, ["/sosnowiec/"]));
  assert.throws(() => buildQRLink({ ...data, code: "" }, ["/sosnowiec/"]));
});
test("QR usuwa stare parametry śledzenia i nie umieszcza tekstu w SVG", () => {
  const link = buildQRLink(
    { ...data, target: "/sosnowiec/?email=test&old=1#sekcja" },
    ["/sosnowiec/"],
  );
  assert.ok(!link.includes("email="));
  const svg = qrSVG(link);
  assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /M4,/);
  assert.ok(!svg.includes(link));
  assert.ok(!svg.includes("<script"));
});
