import { published, siteURL, pagePath, type RecordData } from "./content";
import { pageArticles, renderRSS } from "./page-news.mjs";
export function pageFeed(page: RecordData) {
  return new Response(
    renderRSS({
      title: page.title + " — aktualności i artykuły",
      description: page.excerpt,
      site: siteURL(pagePath(page)),
      feed: siteURL(pagePath(page) + "feed.xml"),
      items: (pageArticles(page, published()) as RecordData[])
        .filter((post) => !post.noindex)
        .map((post) => ({
          title: post.title,
          description: post.excerpt,
          url: siteURL("/artykuly/" + post.slug + "/"),
          date: post.published_at || post.updated_at,
        })),
    }),
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
