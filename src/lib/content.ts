import { clean, visible } from "./schema.mjs";
export type RecordData = Record<string, any> & { id: string };
const documents = import.meta.glob<Record<string, unknown>>(
  "/content/**/*.json",
  { eager: true, import: "default" },
);
export function rows(resource: string): RecordData[] {
  return Object.entries(documents)
    .filter(([name]) => name.startsWith("/content/" + resource + "/"))
    .map(([, data]) => clean(resource, data));
}
export const settings = () => rows("settings")[0];
export const published = () =>
  rows("posts")
    .filter((p) => visible(p))
    .sort(
      (a, b) =>
        Date.parse(b.published_at || b.updated_at) -
        Date.parse(a.published_at || a.updated_at),
    );
export const pages = () => rows("pages").filter((p) => visible(p));
export const categoryName = (id: string) =>
  rows("categories").find((c) => c.id === id)?.name || "Poradnik";
export const siteURL = (pathname: string) =>
  new URL(pathname, settings().site_url).href;
export function prepareBody(html: string) {
  let index = 0;
  const toc: { id: string; title: string }[] = [];
  const body = html.replace(/<h([23])>(.*?)<\/h\1>/g, (_, level, title) => {
    const id = "sekcja-" + ++index;
    toc.push({ id, title: title.replace(/<[^>]*>/g, " ") });
    return `<h${level} id="${id}">${title}</h${level}>`;
  });
  return { body, toc };
}
export const date = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(new Date(value));
export const readingTime = (body: string) =>
  Math.max(
    1,
    Math.ceil(body.replace(/<[^>]*>/g, " ").split(/\s+/).length / 200),
  );

export const pagePath = (page: RecordData) =>
  `/${page.section === "sosnowiec" ? "sosnowiec/" : ""}${page.slug}/`;

export const placePath = (place: RecordData) => `/sosnowiec/instytucje/${place.slug || place.id}/`;
export const postAuthor = (post: RecordData) => rows('authors').find(a => a.id === post.author_id);
