import { qrcodegen } from "./vendor/qrcodegen.mjs";
export function qrLabel(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);
}
export function buildQRLink({ target, source, campaign, code }, allowedPaths) {
  const url = new URL(target, "https://mostpomocy.pl");
  if (
    url.origin !== "https://mostpomocy.pl" ||
    !allowedPaths.includes(url.pathname)
  )
    throw new Error("Wybierz opublikowaną stronę MostPomocy z listy.");
  const labels = {
    utm_source: qrLabel(source),
    utm_medium: "qr",
    utm_campaign: qrLabel(campaign),
    utm_content: qrLabel(code),
  };
  if (!labels.utm_source || !labels.utm_campaign || !labels.utm_content)
    throw new Error("Uzupełnij miejsce, kampanię i oznaczenie kodu.");
  url.search = "";
  url.hash = "";
  for (const [key, value] of Object.entries(labels))
    url.searchParams.set(key, value);
  return url.href;
}
export function qrSVG(url) {
  const qr = qrcodegen.QrCode.encodeText(url, qrcodegen.QrCode.Ecc.MEDIUM);
  const border = 4,
    size = qr.size + border * 2,
    paths = [];
  for (let y = 0; y < qr.size; y++)
    for (let x = 0; x < qr.size; x++)
      if (qr.getModule(x, y))
        paths.push(`M${x + border},${y + border}h1v1h-1z`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="1024" height="1024"><rect width="100%" height="100%" fill="#fff"/><path d="${paths.join("")}" fill="#000"/></svg>`;
}
