import { discoverable, settings, siteURL, xml } from "../lib/discovery";
import { rows, pagePath, type RecordData } from "../lib/content";
export function GET() {
  const documents: (RecordData & {path: string})[] = [
    ...rows('posts').map(p => ({ ...p, path: `/artykuly/${p.slug}/` })),
    ...rows('pages').map(p => ({ ...p, path: pagePath(p) })),
    ...rows('galleries').map(p => ({ ...p, path: `/galeria/${p.slug}/` })),
    ...rows('events').map(p => ({ ...p, path: `/wydarzenia/${p.slug}/` })),
  ];
  const byPath = new Map(documents.map(p => [p.path, p]));
  const entries = settings().allow_indexing ? discoverable().filter(p => {
    const doc = byPath.get(p.path);
    return !doc?.canonical_url || doc.canonical_url === siteURL(p.path);
  }) : [];
  function images(path: string) {
    const doc = byPath.get(path);
    if (!doc) return '';
    const urls = [doc.image, ...(doc.images || []).map((i: {src: string}) => i.src),
      ...Array.from((doc.body || '').matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g), (m: RegExpMatchArray) => m[1])];
    return [...new Set(urls.filter(Boolean).map(u => siteURL(u)))].slice(0, 1000)
      .map(u => `\n    <image:image><image:loc>${xml(u)}</image:loc></image:image>`).join('');
  }
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      entries
        .map(
          (p) =>
            `  <url>\n    <loc>${xml(siteURL(p.path))}</loc>${p.updated ? `\n    <lastmod>${new Date(p.updated).toISOString()}</lastmod>` : ""}${images(p.path)}\n  </url>`,
        )
        .join("\n") +
      "\n</urlset>\n",
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
