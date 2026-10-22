import { published, pages, rows, settings, siteURL } from "./content";
export const xml = (v: unknown) =>
  String(v ?? "").replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function discoverable() {
  const posts = published().filter((p) => !p.noindex);
  return [
    { path: "/", updated: "" },
    { path: "/blog/", updated: "" },
    { path: "/sosnowiec/", updated: "" },
    { path: "/od-czego-zaczac/", updated: "" },
    { path: "/dostepnosc/", updated: "" },
    ...posts.map((p) => ({
      path: `/artykuly/${p.slug}/`,
      updated: p.updated_at || p.published_at,
    })),
    ...pages()
      .filter((p) => !p.noindex)
      .map((p) => ({
        path: `/${p.slug}/`,
        updated: p.updated_at || p.published_at,
      })),
    ...rows("categories")
      .filter((c) => posts.some((p) => p.category_id === c.id))
      .map((c) => ({ path: `/kategorie/${c.slug}/`, updated: "" })),
    ...rows("tags")
      .filter((t) => posts.some((p) => p.tags.includes(t.id)))
      .map((t) => ({ path: `/tagi/${t.slug}/`, updated: "" })),
  ];
}
export { published, pages, settings, siteURL };
