import { settings, siteURL } from "../lib/content";
export function GET() {
  return new Response(
    `User-agent: *\n${settings().allow_indexing ? "Allow: /" : "Disallow: /"}\n\nSitemap: ${siteURL("/sitemap.xml")}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
