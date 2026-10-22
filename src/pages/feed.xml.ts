import { published, settings, siteURL, xml } from "../lib/discovery";
export function GET() {
  const config = settings();
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
      `<title>${xml(config.title)}</title><link>${xml(config.site_url)}</link><description>${xml(config.description)}</description><language>pl</language><atom:link href="${xml(siteURL("/feed.xml"))}" rel="self" type="application/rss+xml"/>` +
      published()
        .filter((p) => !p.noindex)
        .map(
          (p) =>
            `<item><title>${xml(p.title)}</title><link>${xml(siteURL("/artykuly/" + p.slug + "/"))}</link><guid isPermaLink="true">${xml(siteURL("/artykuly/" + p.slug + "/"))}</guid><description>${xml(p.excerpt)}</description><pubDate>${new Date(p.published_at || p.updated_at).toUTCString()}</pubDate></item>`,
        )
        .join("") +
      "</channel></rss>",
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
