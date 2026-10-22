import { z } from "zod";
import sanitize from "sanitize-html";
export const resources = [
  "posts",
  "categories",
  "local_categories",
  "tags",
  "places",
  "pages",
  "settings",
  "media",
];
export const reserved = [
  "blog",
  "artykuly",
  "tagi",
  "kategorie",
  "sosnowiec",
  "wsparcie",
  "admin",
  "moja-kartka",
  "od-czego-zaczac",
  "dostepnosc",
  "404",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "feed.xml",
  "bez-stygmy",
];
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Małe litery bez polskich znaków i myślniki",
  )
  .max(160);
const text = z.string();
const url = z
  .string()
  .refine(
    (v) =>
      !v || /^https:\/\//.test(v) || /^\/uploads\/[a-zA-Z0-9._/-]+$/.test(v),
    "Wymagany adres HTTPS lub zdjęcie z biblioteki",
  );
const base = {
  id: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/)
    .optional(),
};
const status = z
  .enum(["draft", "published", "scheduled", "trashed"])
  .default("draft");
const seo = {
  seo_title: text.max(180).default(""),
  seo_description: text.max(400).default(""),
  noindex: z.boolean().default(false),
  canonical_url: z
    .string()
    .refine(
      (v) => !v || /^https:\/\//.test(v),
      "Adres kanoniczny musi używać HTTPS",
    )
    .default(""),
};
const publication = {
  status,
  published_at: text.nullable().default(null),
  updated_at: text.optional(),
};
const schemas = {
  media: z.object({
    ...base,
    name: text.max(200),
    url,
    alt: text.max(300).default(""),
  }),
  posts: z.object({
    ...base,
    title: text.min(3).max(200),
    slug,
    excerpt: text.max(600).default(""),
    body: text.max(200000).default(""),
    category_id: text.default(""),
    local_category_id: text.default(""),
    tags: z.array(text).max(20).default([]),
    scope: z.enum(["general", "sosnowiec"]).default("general"),
    author: text.max(100).default("Igor Pabiańczyk"),
    featured: z.boolean().default(false),
    toc: z.boolean().default(true),
    image: url.default(""),
    image_alt: text.max(300).default(""),
    sources: text.max(15000).default(""),
    ...seo,
    ...publication,
  }),
  pages: z.object({
    ...base,
    notice: text.max(600).default(""),
    related_category_id: text.default(""),
    section: z.enum(["general", "sosnowiec"]).default("general"),
    local_category_id: text.default(""),
    title: text.min(3).max(200),
    slug,
    excerpt: text.max(600).default(""),
    body: text.max(200000).default(""),
    menu_label: text.max(40).default(""),
    show_in_nav: z.boolean().default(false),
    nav_order: z.coerce.number().min(0).max(100).default(50),
    ...seo,
    ...publication,
  }),
  categories: z.object({
    ...base,
    name: text.min(2).max(80),
    slug,
    description: text.max(500).default(""),
  }),
  local_categories: z.object({
    ...base,
    name: text.min(2).max(80),
    slug,
    description: text.max(500).default(""),
  }),
  tags: z.object({
    ...base,
    name: text.min(2).max(60),
    slug,
    description: text.max(500).default(""),
  }),
  places: z.object({
    ...base,
    name: text.min(3).max(160),
    description: text.max(2500).default(""),
    address: text.max(250).default(""),
    phone: text.max(80).default(""),
    email: text.email().or(z.literal("")).default(""),
    website: url.default(""),
    section: z.enum(["mops", "institution"]).default("institution"),
    parent_id: text.default(""),
    city: z.literal("Sosnowiec").default("Sosnowiec"),
    verified_at: text.default(""),
    status: z.enum(["draft", "published"]).default("draft"),
  }),
  settings: z.object({
    ...base,
    title: text.min(2).max(100),
    description: text.max(500).default(""),
    site_url: z
      .string()
      .url()
      .refine(
        (v) => v.startsWith("https://"),
        "Publiczny adres strony musi używać HTTPS",
      ),
    repository: text.regex(/^[\w.-]+\/[\w.-]+$/),
    branch: text.default("main"),
    ga_measurement_id: text.regex(/^(G-[A-Z0-9]+)?$/).default(""),
    google_verification: text.regex(/^[\w-]*$/).default(""),
    bing_verification: text.regex(/^[\w-]*$/).default(""),
    default_image: url.default(""),
    contact_email: text.email().or(z.literal("")).default(""),
    author_name: text.default("Igor Pabiańczyk"),
    about: text.default(""),
    allow_indexing: z.boolean().default(true),
    allow_ai_search: z.boolean().default(true),
    social_profiles: z.array(z.string().url()).default([]),
    footer_note: text.default(""),
  }),
};
export function clean(resource, input) {
  if (!schemas[resource]) throw new Error("Nieznana kolekcja");
  const normalized = Object.fromEntries(
    Object.entries(input).map(([key, val]) => [
      key,
      val === null && key !== "published_at" ? undefined : val,
    ]),
  );
  const data = schemas[resource].parse(normalized);
  data.id = data.id || crypto.randomUUID();
  if (data.body !== undefined) {
    data.body = sanitize(data.body, {
      allowedTags: [
        "p",
        "br",
        "h2",
        "h3",
        "h4",
        "strong",
        "em",
        "u",
        "s",
        "blockquote",
        "ul",
        "ol",
        "li",
        "a",
        "img",
        "hr",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "caption",
      ],
      allowedAttributes: {
        a: ["href", "title", "target", "rel"],
        img: ["src", "alt", "width", "height"],
        th: ["scope"],
      },
      allowedSchemes: ["https", "mailto", "tel"],
      transformTags: {
        h1: "h2",
        a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
      },
    });
  }
  if (
    resource === "pages" &&
    (reserved.includes(data.slug) ||
      (data.section === "sosnowiec" &&
        ["blog", "kategorie"].includes(data.slug)))
  )
    throw new Error("Ten adres jest zarezerwowany przez serwis");
  if (["posts", "pages"].includes(resource)) {
    if (["published", "scheduled"].includes(data.status) && !data.body.trim())
      throw new Error("Opublikowany tekst nie może być pusty");
    if (
      resource === "posts" &&
      ["published", "scheduled"].includes(data.status) &&
      !data.category_id
    )
      throw new Error("Wybierz kategorię");
    if (data.published_at && Number.isNaN(Date.parse(data.published_at)))
      throw new Error("Nieprawidłowy termin publikacji");
    if (data.status === "scheduled" && !data.published_at)
      throw new Error("Podaj termin publikacji");
    if (data.status === "published" && !data.published_at)
      throw new Error("Podaj datę publikacji");
    if (data.updated_at && Number.isNaN(Date.parse(data.updated_at)))
      throw new Error("Nieprawidłowa data aktualizacji");
    data.updated_at =
      data.updated_at || data.published_at || "1970-01-01T00:00:00Z";
  }
  return data;
}
export const visible = (item, now = Date.now()) =>
  ["published", "scheduled"].includes(item.status) &&
  (!item.published_at || Date.parse(item.published_at) <= now);
