import { feedEntries, settings, siteURL } from "../lib/discovery";
import { renderRSS } from "../lib/page-news.mjs";
export function GET() {
  const config = settings();
  return new Response(
    renderRSS({
      title: config.title + " — nowe publikacje",
      description: config.description,
      site: config.site_url,
      feed: siteURL("/feed.xml"),
      items: feedEntries(),
    }),
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
