import fs from "node:fs";
import YAML from "yaml";
const f = (name, label, type = "string", extra = {}) => ({
  name,
  label,
  type,
  ...extra,
});
const id = f("id", "ID", "uuid", {
  hidden: true,
  options: { editable: false, generate: false },
});
const slug = f("slug", "Adres URL", "string", {
  required: true,
  description: "Małe litery bez polskich znaków, np. wolontariat",
  pattern: {
    regex: "^[a-z0-9]+(-[a-z0-9]+)*$",
    message: "Użyj małych liter, cyfr i myślników.",
  },
});
const body = f("body", "Treść", "rich-text", {
  required: true,
  options: { format: "html", media: "images", switcher: true },
});
const status = f("status", "Status", "select", {
  default: "draft",
  options: {
    values: [
      { name: "draft", label: "Szkic" },
      { name: "published", label: "Opublikowany" },
      { name: "scheduled", label: "Zaplanowany" },
      { name: "trashed", label: "Kosz" },
    ],
  },
});
const seo = [
  f("seo_title", "Tytuł dla Google"),
  f("seo_description", "Opis w wynikach wyszukiwania", "text"),
  f("canonical_url", "Adres kanoniczny (opcjonalnie)"),
  f("noindex", "Nie indeksuj tej treści", "boolean", { default: false }),
];
const dates = [
  f("published_at", "Termin publikacji", "date", {
    required: true,
    options: { time: true, format: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX" },
  }),
  f("updated_at", "Data aktualizacji", "date", {
    options: { time: true, format: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX" },
  }),
];
const reference = (name, label, collection, multiple = false) =>
  f(name, label, "reference", {
    options: {
      collection,
      search: "fields.name",
      value: "{fields.id}",
      label: "{fields.name}",
      multiple,
    },
  });
const collection = (name, label, fields, view = {}) => ({
  name,
  label,
  type: "collection",
  path: "content/" + name,
  format: "json",
  filename: { template: "{fields.id}.json", field: false },
  fields: [id, ...fields],
  view: { primary: "name", ...view },
});
const tileField = f("tiles", "Kafelki informacyjne", "object", {
  description:
    "Dodaj kafelek, wpisz tytuł, opis i opcjonalny odnośnik. Możesz zmieniać kolejność.",
  list: { collapsible: { collapsed: true, summary: "{fields.title}" } },
  fields: [
    f("title", "Tytuł kafelka", "string", { required: true }),
    f("text", "Opis", "text"),
    f("url", "Odnośnik HTTPS lub /adres/"),
  ],
});
const cms = {
  media: [
    {
      name: "files",
      label: "Dokumenty",
      input: "public/uploads/files",
      output: "/uploads/files",
      extensions: ["pdf", "docx", "xlsx", "pptx", "txt", "csv", "ics"],
      rename: "random",
    },

    {
      name: "images",
      label: "Zdjęcia",
      input: "public/uploads",
      output: "/uploads",
      categories: ["image"],
      extensions: ["png", "jpg", "jpeg", "webp"],
      rename: "random",
    },
  ],
  content: [
    collection(
      "events",
      "Wydarzenia",
      [
        f("title", "Nazwa wydarzenia", "string", { required: true }),
        slug,
        f("excerpt", "Krótki opis", "text"),
        body,
        f("starts_at", "Początek", "date", {
          required: true,
          options: { time: true, format: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX" },
        }),
        f("ends_at", "Koniec (opcjonalnie)", "date", {
          options: { time: true, format: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX" },
        }),
        f("location", "Miejsce lub informacja o wydarzeniu online"),
        f("organizer", "Organizator"),
        f("scope", "Zasięg", "select", {
          options: {
            values: [
              { name: "general", label: "Ogólnopolskie" },
              { name: "sosnowiec", label: "Sosnowiec" },
            ],
          },
          default: "sosnowiec",
        }),
        f("registration_url", "Oficjalny adres zapisów HTTPS (opcjonalnie)"),
        f("accessibility", "Informacje o dostępności", "text"),
        status,
        ...dates,
        ...seo,
      ],
      { primary: "title" },
    ),
    collection(
      "galleries",
      "Galerie zdjęć",
      [
        f("title", "Tytuł", "string", { required: true }),
        slug,
        f("excerpt", "Opis", "text"),
        f("images", "Zdjęcia", "object", {
          list: { collapsible: { collapsed: true, summary: "{fields.alt}" } },
          fields: [
            f("src", "Zdjęcie", "image", {
              required: true,
              options: { media: "images" },
            }),
            f("alt", "Opis alternatywny", "string", { required: true }),
            f("caption", "Podpis", "text"),
            f("credit", "Autor / źródło i prawa do zdjęcia"),
          ],
        }),
        status,
        ...dates,
        ...seo,
      ],
      { primary: "title" },
    ),
    collection(
      "downloads",
      "Pliki do pobrania",
      [
        f("title", "Nazwa pliku", "string", { required: true }),
        f("description", "Opis", "text"),
        f("file", "Plik", "file", {
          required: true,
          options: { media: "files" },
        }),
        f("format", "Format, np. PDF"),
        f(
          "accessibility",
          "Dostępność dokumentu lub alternatywa tekstowa",
          "text",
        ),
        status,
        ...dates,
      ],
      { primary: "title" },
    ),
    collection(
      "banners",
      "Komunikaty i banery",
      [
        f("title", "Tytuł", "string", { required: true }),
        f("description", "Treść", "text"),
        f("url", "Odnośnik /adres/ lub HTTPS"),
        f("scope", "Gdzie pokazać", "select", {
          default: "all",
          options: {
            values: [
              { name: "all", label: "Cała strona" },
              { name: "sosnowiec", label: "Tylko Sosnowiec" },
            ],
          },
        }),
        status,
        ...dates,
      ],
      { primary: "title" },
    ),

    collection(
      "posts",
      "Artykuły",
      [
        f("title", "Tytuł", "string", { required: true }),
        slug,
        reference("category_id", "Kategoria bloga ogólnego", "categories"),
        reference(
          "local_category_id",
          "Kategoria bloga Sosnowiec (dla lokalnych artykułów)",
          "local_categories",
        ),
        reference("tags", "Tagi", "tags", true),
        f("scope", "Publikacja", "select", {
          default: "general",
          options: {
            values: [
              { name: "general", label: "Blog ogólny" },
              { name: "sosnowiec", label: "Blog + Z Sosnowca" },
            ],
          },
        }),
        f("excerpt", "Wprowadzenie", "text"),
        body,
        f(
          "summary_points",
          "Najważniejsze w skrócie — po jednym punkcie",
          "string",
          { list: true },
        ),
        tileField,
        f("cover_style", "Kolor kafelka artykułu", "select", {
          default: "sage",
          options: {
            values: [
              { name: "sage", label: "Szałwia" },
              { name: "sand", label: "Piasek" },
              { name: "lilac", label: "Lawenda" },
              { name: "rose", label: "Brzoskwinia" },
            ],
          },
        }),
        reference(
          "related_place_ids",
          "Powiązane miejsca pomocy",
          "places",
          true,
        ),
        f("image", "Zdjęcie główne", "image", { options: { media: "images" } }),
        f("image_alt", "Opis alternatywny zdjęcia"),
        f("author", "Autor", "string", { default: "Igor Pabiańczyk" }),
        reference(
          "author_id",
          "Profil autora (opcjonalnie, ma pierwszeństwo przed wpisanym nazwiskiem)",
          "authors",
        ),
        status,
        ...dates,
        f("featured", "Wyróżnij na głównej", "boolean"),
        f("toc", "Pokaż spis treści", "boolean", { default: true }),
        f("sources", "Źródła — po jednym adresie HTTPS w wierszu", "text"),
        ...seo,
      ],
      {
        primary: "title",
        fields: ["title", "status", "category_id", "published_at"],
        sort: ["published_at", "title"],
        default: { sort: "published_at", order: "desc" },
      },
    ),
    collection(
      "pages",
      "Podstrony",
      [
        f("title", "Tytuł", "string", { required: true }),
        slug,
        f("notice", "Ważny komunikat / status projektu (opcjonalnie)", "text"),
        f("section", "Gdzie ma być podstrona?", "select", {
          default: "general",
          options: {
            values: [
              { name: "general", label: "Strona główna: /twoj-adres/" },
              { name: "sosnowiec", label: "Sosnowiec: /sosnowiec/twoj-adres/" },
            ],
          },
        }),
        reference(
          "local_category_id",
          "Kategoria lokalnej podstrony (opcjonalnie)",
          "local_categories",
        ),
        f("excerpt", "Wprowadzenie", "text"),
        body,
        reference(
          "related_category_id",
          "Powiązana kategoria (opcjonalnie)",
          "categories",
        ),
        status,
        ...dates,
        f("show_in_nav", "Pokaż w menu głównym", "boolean", { default: false }),
        f("menu_label", "Krótka nazwa w menu"),
        f("nav_order", "Kolejność w menu (0–100)", "number", {
          default: 50,
          options: { min: 0, max: 100 },
        }),
        ...seo,
      ],
      { primary: "title", fields: ["title", "slug", "status", "show_in_nav"] },
    ),
    collection("local_categories", "Sosnowiec — kategorie", [
      f("name", "Nazwa", "string", { required: true }),
      slug,
      f("description", "Opis", "text"),
    ]),
    collection("tags", "Tagi", [
      f("name", "Nazwa", "string", { required: true }),
      slug,
      f("description", "Opis tagu", "text"),
    ]),
    collection("categories", "Kategorie", [
      f("name", "Nazwa", "string", { required: true }),
      slug,
      f("description", "Opis kategorii", "text"),
    ]),
    collection("places", "Pomoc w Sosnowcu", [
      f("name", "Nazwa", "string", { required: true }),
      {
        ...slug,
        required: false,
        description:
          "Adres wizytówki. Dla nowej jednostki wpisz np. zespol-interdyscyplinarny.",
      },
      f("section", "Zakładka", "select", {
        default: "institution",
        options: {
          values: [
            { name: "mops", label: "MOPS i działy" },
            { name: "institution", label: "Inne instytucje" },
          ],
        },
      }),
      reference("parent_id", "Jednostka nadrzędna (opcjonalnie)", "places"),
      f("description", "Opis", "text"),
      tileField,
      f("opening_hours", "Godziny i sposób umawiania wizyty", "text"),
      f("accessibility", "Dostępność — tylko potwierdzone informacje", "text"),
      f("preparation", "Co przygotować przed kontaktem", "string", {
        list: true,
      }),
      f("address", "Adres"),
      f("phone", "Telefon"),
      f("email", "E-mail"),
      f("website", "Oficjalna strona"),
      f("city", "Miasto", "string", { default: "Sosnowiec", readonly: true }),
      f("verified_at", "Data sprawdzenia kontaktu"),
      f("status", "Status", "select", {
        default: "draft",
        options: {
          values: [
            { name: "draft", label: "Szkic" },
            { name: "published", label: "Opublikowany" },
          ],
        },
      }),
    ]),
    collection("authors", "Autorzy — profile i podpisy", [
      f("name", "Imię i nazwisko", "string", { required: true }),
      slug,
      f("role", "Rola / potwierdzone kwalifikacje"),
      f("bio", "Biogram", "text"),
      f("website", "Strona autora (opcjonalnie)"),
    ]),
    {
      name: "settings",
      label: "Google, SEO i ustawienia strony",
      type: "file",
      path: "content/settings/main.json",
      format: "json",
      fields: [
        f("id", "ID", "string", { hidden: true, default: "main" }),
        f("title", "Nazwa strony", "string", { required: true }),
        f("description", "Domyślny opis strony", "text"),
        f("site_url", "Publiczny adres HTTPS", "string", { required: true }),
        f("repository", "Repozytorium", "string", { readonly: true }),
        f("branch", "Gałąź publikacji", "string", { readonly: true }),
        f("author_name", "Autor"),
        f("contact_email", "Publiczny adres e-mail"),
        f("about", "O projekcie", "text"),
        f("default_image", "Domyślny obraz udostępniania", "image", {
          options: { media: "images" },
        }),
        f("ga_measurement_id", "Google Analytics 4 — identyfikator G-…"),
        f("ga_property_id", "Numer usługi GA4 — same cyfry (do raportów)"),
        f(
          "google_client_id",
          "Google OAuth Client ID — do prywatnych raportów w panelu",
          "string",
          {
            description:
              "Publiczny identyfikator klienta aplikacji internetowej. Żadnych kluczy prywatnych. Instrukcja w /admin/.",
          },
        ),
        f("navigation", "Dodatkowe linki menu", "object", {
          list: true,
          fields: [
            f("label", "Nazwa", "string", { required: true }),
            f("url", "Adres na stronie, np. /wydarzenia/", "string", {
              required: true,
            }),
          ],
        }),
        f("google_verification", "Google Search Console — kod weryfikacyjny"),
        f("bing_verification", "Bing Webmaster Tools — kod weryfikacyjny"),
        f(
          "allow_indexing",
          "Zezwól na indeksowanie publicznej strony",
          "boolean",
          { default: true },
        ),
        f(
          "allow_ai_search",
          "Publikuj opcjonalny spis llms.txt dla narzędzi AI",
          "boolean",
          { default: true },
        ),
        f("social_profiles", "Oficjalne profile autora / projektu", "string", {
          list: true,
        }),
        f("footer_note", "Tekst stopki", "text"),
      ],
    },
  ],
  actions: [
    {
      name: "check-content",
      label: "Sprawdź treści i odnośniki",
      workflow: "check-content.yml",
      confirm: false,
    },
    {
      name: "publish",
      label: "Zbuduj i opublikuj stronę",
      workflow: "pages.yml",
      confirm: {
        title: "Opublikować aktualną treść?",
        message: "Uruchomi budowanie strony na GitHub Pages.",
        button: "Publikuj",
      },
    },
  ],
};
fs.writeFileSync(".pages.yml", YAML.stringify(cms));
console.log("Pages CMS configuration generated");
