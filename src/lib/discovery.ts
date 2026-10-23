import { visible } from "./schema.mjs";
import { published, pages, rows, settings, siteURL, pagePath } from "./content";
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
    { path: "/sosnowiec/blog/", updated: "" },
    ...rows("local_categories").map((c) => ({
      path: `/sosnowiec/kategorie/${c.slug}/`,
      updated: "",
    })),
    { path: "/od-czego-zaczac/", updated: "" },
    { path: "/dostepnosc/", updated: "" },
    { path: "/obserwuj/", updated: "" },
    { path: "/narzedzia/", updated: "" },
    ...[
      "aplikacja",
      "szukaj",
      "wydarzenia",
      "galeria",
      "do-pobrania",
      "nowosci",
    ].map((slug) => ({ path: `/${slug}/`, updated: "" })),
    ...rows("events")
      .filter((e) => visible(e) && !e.noindex)
      .map((e) => ({
        path: `/wydarzenia/${e.slug}/`,
        updated: e.updated_at || e.published_at,
      })),
    ...rows("galleries")
      .filter((e) => visible(e) && !e.noindex)
      .map((e) => ({
        path: `/galeria/${e.slug}/`,
        updated: e.updated_at || e.published_at,
      })),
    ...rows("places")
      .filter((p) => p.status === "published")
      .map((p) => ({
        path: `/sosnowiec/instytucje/${p.slug || p.id}/`,
        updated: "",
      })),
    ...rows("authors").map((a) => ({
      path: `/autorzy/${a.slug}/`,
      updated: "",
    })),
    ...posts.map((p) => ({
      path: `/artykuly/${p.slug}/`,
      updated: p.updated_at || p.published_at,
    })),
    ...pages()
      .filter((p) => !p.noindex)
      .map((p) => ({
        path: pagePath(p),
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
export { published, pages, settings, siteURL, pagePath };
