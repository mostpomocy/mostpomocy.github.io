import { discoverable, settings, siteURL, xml } from "../lib/discovery";
export function GET() {
  const entries = settings().allow_indexing ? discoverable() : [];
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      entries
        .map(
          (p) =>
            `<url><loc>${xml(siteURL(p.path))}</loc>${p.updated ? `<lastmod>${new Date(p.updated).toISOString()}</lastmod>` : ""}</url>`,
        )
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
