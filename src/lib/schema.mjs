import { z } from "zod";
import sanitize from "sanitize-html";
import { safeDestination } from "./short-links.mjs";
export const resources = [
  "links",
  "posts",
  "categories",
  "local_categories",
  "tags",
  "places",
  "pages",
  "settings",
  "media",
  "authors",
  "events",
  "galleries",
  "downloads",
  "banners",
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
  "instytucje",
  "autorzy",
  "obserwuj",
  "narzedzia",
  "qr",
  "l",
  "linki",
  "offline",
  "aplikacja",
  "szukaj",
  "wydarzenia",
  "galeria",
  "do-pobrania",
  "zapisane",
  "nowosci",
];
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Małe litery bez polskich znaków i myślniki",
  )
  .max(160);
const text = z.string();
const safeLink = z
  .string()
  .refine(
    (v) =>
      !v || /^https:\/\//.test(v) || /^\/(?!\/)[a-zA-Z0-9/_?#=%.&-]*$/.test(v),
    "Adres HTTPS lub ścieżka na tej stronie",
  );
const tiles = z
  .array(
    z.object({
      title: text.min(2).max(120),
      text: text.max(600).default(""),
      url: safeLink.default(""),
    }),
  )
  .max(12)
  .default([]);
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
const faq = z
  .array(
    z.object({ question: text.min(3).max(300), answer: text.min(3).max(2000) }),
  )
  .default([]);
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
  links: z.object({
    ...base,
    name: text.min(3).max(160),
    slug: slug.max(48),
    target_url: text
      .min(1)
      .max(2000)
      .refine((v) => {
        try {
          safeDestination(v);
          return true;
        } catch {
          return false;
        }
      }, "Podaj HTTPS lub ścieżkę MostPomocy. Bez danych logowania i przekierowań do /l/."),
    source: text.regex(/^[a-z0-9_-]{1,64}$/).default("mostpomocy"),
    medium: z.enum(["qr", "short_link"]).default("short_link"),
    campaign: text.regex(/^[a-z0-9_-]{1,64}$/).default("linki_2026"),
    status: z.enum(["draft", "published", "trashed"]).default("draft"),
  }),
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
    author_id: text.default(""),
    faq,
    summary_points: z.array(text.max(300)).default([]),
    tiles,
    cover_style: z.enum(["sage", "sand", "lilac", "rose"]).default("sage"),
    related_page_ids: z.array(text).default([]),
    related_place_ids: z.array(text).max(12).default([]),
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
    tiles,
    image: url.default(""),
    image_alt: text.max(300).default(""),
    faq,
    notice: text.max(600).default(""),
    show_updates: z.boolean().default(false),
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
    slug: slug.optional(),
    tiles,
    opening_hours: text.max(1000).default(""),
    accessibility: text.max(1500).default(""),
    preparation: z.array(text.max(300)).max(12).default([]),
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
    faq,
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
    ga_property_id: text.regex(/^\d*$/).default(""),
    google_client_id: text.regex(/^[a-zA-Z0-9._-]*$/).default(""),
    navigation: z
      .array(
        z.object({
          label: text.min(2).max(40),
          url: text.regex(/^\/(?!\/)[a-zA-Z0-9/_#?-]*$/),
        }),
      )
      .max(10)
      .default([]),
    newsletter_url: z
      .string()
      .url()
      .refine((v) => v.startsWith("https://"))
      .or(z.literal(""))
      .default(""),
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
  events: z.object({
    ...base,
    title: text.min(3).max(200),
    slug,
    excerpt: text.max(600).default(""),
    body: text.max(50000).default(""),
    starts_at: text.datetime({ offset: true }),
    ends_at: text.datetime({ offset: true }).or(z.literal("")).default(""),
    location: text.max(300).default(""),
    organizer: text.max(160).default(""),
    scope: z.enum(["general", "sosnowiec"]).default("sosnowiec"),
    registration_url: safeLink.default(""),
    accessibility: text.max(1000).default(""),
    ...seo,
    ...publication,
  }),
  galleries: z.object({
    ...base,
    title: text.min(3).max(200),
    slug,
    excerpt: text.max(600).default(""),
    images: z
      .array(
        z.object({
          src: text.regex(
            /^\/uploads\/[a-zA-Z0-9._/-]+\.(png|jpg|jpeg|webp)$/i,
          ),
          alt: text.min(3).max(300),
          caption: text.max(500).default(""),
          credit: text.max(300).default(""),
        }),
      )
      .max(60)
      .default([]),
    ...seo,
    ...publication,
  }),
  downloads: z.object({
    ...base,
    title: text.min(3).max(200),
    description: text.max(1500).default(""),
    file: text.regex(
      /^\/uploads\/files\/[a-zA-Z0-9._/-]+\.(pdf|docx|xlsx|pptx|txt|csv|ics)$/i,
    ),
    format: text.max(30).default(""),
    accessibility: text.max(600).default(""),
    ...publication,
  }),
  banners: z.object({
    ...base,
    title: text.min(3).max(120),
    description: text.max(500).default(""),
    url: safeLink.default(""),
    scope: z.enum(["all", "sosnowiec"]).default("all"),
    ...publication,
  }),
  authors: z.object({
    ...base,
    name: text.min(2).max(100),
    slug,
    bio: text.max(1500).default(""),
    role: text.max(150).default(""),
    website: safeLink.default(""),
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
  if (
    resource === "events" &&
    data.ends_at &&
    Date.parse(data.ends_at) <= Date.parse(data.starts_at)
  )
    throw new Error("Koniec wydarzenia musi być późniejszy niż początek");
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
    // Derive defaults only after sanitizing the article; explicit SEO wins.
    if (!data.seo_title.trim()) data.seo_title = data.title;
    if (!data.seo_description.trim()) {
      const plain = sanitize(data.excerpt || data.body, {
        allowedTags: [], allowedAttributes: {},
      }).replace(/\s+/g, " ").trim();
      data.seo_description = plain.length > 160
        ? plain.slice(0, 157).replace(/\s+\S*$/, "") + "..."
        : plain;
    }
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
  if (["events", "galleries", "downloads", "banners"].includes(resource)) {
    if (data.published_at && Number.isNaN(Date.parse(data.published_at)))
      throw new Error("Nieprawidłowa data publikacji");
    if (["published", "scheduled"].includes(data.status) && !data.published_at)
      throw new Error("Podaj datę publikacji");
    if (data.updated_at && Number.isNaN(Date.parse(data.updated_at)))
      throw new Error("Nieprawidłowa data aktualizacji");
  }
  return data;
}
export const visible = (item, now = Date.now()) =>
  ["published", "scheduled"].includes(item.status) &&
  (!item.published_at || Date.parse(item.published_at) <= now);
