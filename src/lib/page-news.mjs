export function pageArticles(page, posts) {
  return posts.filter(
    (post) =>
      (post.related_page_ids || []).includes(page.id) ||
      (page.related_category_id &&
        post.category_id === page.related_category_id &&
        (page.section !== "sosnowiec" || post.scope === "sosnowiec")),
  );
}
export function renderRSS({ title, description, site, feed, items }) {
  const xml = (value) =>
    String(value ?? "").replace(
      /[<>&"']/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
  return (
    '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    `<title>${xml(title)}</title><link>${xml(site)}</link><description>${xml(description)}</description><language>pl</language><atom:link href="${xml(feed)}" rel="self" type="application/rss+xml"/>` +
    items
      .map(
        (item) =>
          `<item><title>${xml(item.title)}</title><link>${xml(item.url)}</link><guid isPermaLink="true">${xml(item.url)}</guid><description>${xml(item.description)}</description>${item.date ? `<pubDate>${new Date(item.date).toUTCString()}</pubDate>` : ""}</item>`,
      )
      .join("") +
    "</channel></rss>"
  );
}
