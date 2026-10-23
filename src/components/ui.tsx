import { Accessibility } from "./Accessibility";
import type { RecordData } from "../lib/content";
export function Header({
  navigation = [],
}: {
  navigation?: {
    slug: string;
    title: string;
    menu_label?: string;
    url?: string;
  }[];
}) {
  return (
    <>
      <a className="skip" href="#main">
        Przejdź do treści
      </a>
      <div className="topline">
        <div className="container">
          <span>Wiedza o pomocy. Bliżej człowieka.</span>
          <div className="topline-actions">
            <a href="/sosnowiec">● Lokalnie: Sosnowiec</a>
            <Accessibility />
          </div>
        </div>
      </div>
      <header className="site-header container">
        <a href="/" className="brand" aria-label="MostPomocy – strona główna">
          <svg
            viewBox="0 0 42 34"
            width="40"
            height="34"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 29V5m36 24V5M3 18C12 18 13 8 21 8s9 10 18 10M3 29h36M12 15v14m9-21v21m9-14v14"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
          <span>
            most<span className="brand-light">pomocy</span>
            <small>WIEDZA, KTÓRA ŁĄCZY</small>
          </span>
        </a>
        <nav aria-label="Menu główne">
          <a href="/blog">Blog</a>
          <a href="/sosnowiec/">Sosnowiec</a>
          <a href="/od-czego-zaczac">Pierwszy krok</a>
          {navigation.map((p) => (
            <a key={p.slug} href={p.url || "/" + p.slug + "/"}>
              {p.menu_label || p.title}
            </a>
          ))}
        </nav>
        <a
          className="header-search"
          href="/szukaj/"
          aria-label="Szukaj w całej stronie"
        >
          ⌕
        </a>
      </header>
    </>
  );
}
export function Footer({ note }: { note?: string }) {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <a className="footer-brand" href="/">
            mostpomocy<span>.</span>
          </a>
          <p>
            {note ||
              "O pracy socjalnej i wspieraniu ludzi. Z uważnością. Prostym językiem."}
          </p>
        </div>
        <div>
          <strong>Odkrywaj</strong>
          <a href="/sosnowiec-bez-stygmy/">Sosnowiec bez stygmy</a>
          <a href="/blog">Artykuły i poradniki</a>
          <a href="/sosnowiec/">Sosnowiec</a>
          <a href="/o-projekcie">O projekcie i kontakt</a>
        </div>
        <div>
          <strong>Warto wiedzieć</strong>
          <a href="/polityka-prywatnosci/">Prywatność i pliki cookie</a>
          <a href="/dostepnosc/">Dostępność strony</a>
          <a href="/od-czego-zaczac">Od czego zacząć?</a>
          <a href="/moja-kartka">Kartka przed rozmową</a>
          <a href="/aplikacja/">Aplikacja MostPomocy</a>
          <a href="/wydarzenia/">Wydarzenia</a>
          <a href="/galeria/">Galerie</a>
          <a href="/do-pobrania/">Pliki do pobrania</a>
          <a href="/feed.xml">Kanał RSS</a>
          <a href="/obserwuj/">Aplikacja i RSS</a>
          <a href="/narzedzia/">Przydatne narzędzia</a>
          <a href="/admin">Panel redakcyjny ↗</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} MostPomocy · Igor Pabiańczyk</span>
        <span>
          Materiały edukacyjne. Szczegóły wsparcia potwierdzaj w instytucji.
        </span>
      </div>
    </footer>
  );
}
export const categoryName = (categories: RecordData[], id: string) =>
  categories.find((c) => c.id === id)?.name || "Poradnik";
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
function TopicMark({ topic }: { topic: string }) {
  return (
    <svg
      className="cover-symbol topic-mark"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="2" />
      {topic === "zdrowie-psychiczne" ? (
        <path
          d="M22 56c20-30 34 30 54 0s24-10 28-8M22 72c20-30 34 30 54 0s24-10 28-8"
          stroke="currentColor"
          strokeWidth="5"
        />
      ) : topic === "przemoc" ? (
        <path
          d="M60 24 88 36v26c0 20-28 36-28 36S32 82 32 62V36l28-12ZM46 61l10 10 21-24"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path
            d="M32 42h23c7 0 12 5 12 12v32c-6-5-13-7-20-7H32V42ZM88 42H77c-6 0-10 5-10 12"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M88 42v37H77" stroke="currentColor" strokeWidth="4" />
        </>
      )}
    </svg>
  );
}
export function ArticleCard({
  post,
  categories,
}: {
  post: RecordData;
  categories: RecordData[];
}) {
  const topic =
    categories.find((c) => c.id === post.category_id)?.slug || "poradniki";
  return (
    <article
      className="article-card"
      data-post
      data-category={post.category_id}
      data-local-category={post.local_category_id || ""}
      data-tags={JSON.stringify(post.tags || [])}
      data-scope={post.scope || "general"}
      data-title={post.title.toLocaleLowerCase("pl")}
      data-date={post.published_at || post.updated_at}
      data-search={(
        post.title +
        " " +
        post.excerpt +
        " " +
        post.body.replace(/<[^>]*>/g, " ")
      ).toLocaleLowerCase("pl")}
    >
      <a
        className="card-cover"
        href={"/artykuly/" + post.slug}
        tabIndex={-1}
        aria-hidden="true"
        data-topic={topic}
        data-style={post.cover_style}
      >
        {post.image ? (
          <img src={post.image} alt="" loading="lazy" />
        ) : (
          <>
            <span className="cover-word">
              {categoryName(categories, post.category_id)}
            </span>
            <TopicMark topic={topic} />
            <span className="cover-brand">MOSTPOMOCY / CZYTELNIA</span>
          </>
        )}
      </a>
      <div className="card-meta">
        <a
          href={
            "/kategorie/" +
            (categories.find((c) => c.id === post.category_id)?.slug ||
              post.category_id) +
            "/"
          }
        >
          {categoryName(categories, post.category_id)}
        </a>
        <span>{readingTime(post.body)} min czytania</span>
      </div>
      <h3>
        <a href={"/artykuly/" + post.slug}>{post.title}</a>
      </h3>
      <p>{post.excerpt}</p>
      {post.scope === "sosnowiec" && (
        <a className="local-badge" href="/sosnowiec/blog/">
          Z Sosnowca ↗
        </a>
      )}
      <div className="card-bottom">
        <span>{date(post.published_at || post.updated_at)}</span>
        <a
          href={"/artykuly/" + post.slug}
          aria-label={"Przeczytaj: " + post.title}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 19 19 5M5 5h14v14"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
export function Bridge() {
  return (
    <svg
      className="bridge"
      viewBox="0 0 600 460"
      fill="none"
      role="img"
      aria-label="Most łączący dwa brzegi"
    >
      <circle cx="436" cy="109" r="53" fill="#e8b66e" />
      <path
        d="M0 362c100-45 150 25 260-5 150-40 220 35 340-10v113H0Z"
        fill="#c2d1c4"
      />
      <path
        d="M0 395c110-25 180 28 300 2s210-4 300 13M0 433c100-22 160 11 260-5s230-3 340 8"
        stroke="#779c88"
      />
      <path
        d="M38 323h524v31H38zM60 354v66h51v-16c0-51 37-78 75-78s76 27 76 78v16h68v-16c0-51 37-78 75-78s76 27 76 78v16h56v-66"
        fill="#164e40"
      />
      <path
        d="M49 310h501M65 290v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33m42-33v33M55 290h490M74 285V142m0 0c90 0 132 130 226 130S440 142 530 142m0 0v143"
        stroke="#164e40"
        strokeWidth="3"
      />
      <path
        d="M76 171v115m43-99v100m44-65v65m44-29v29m323-116v115m-43-99v100m-44-65v65m-44-29v29"
        stroke="#164e40"
        strokeWidth="1.5"
      />
      <path
        d="M0 333c30-65 40-50 54-4m490 0c25-65 39-73 56-27"
        fill="#62876e"
      />
      <circle cx="273" cy="251" r="9" fill="#164e40" />
      <path
        d="M268 263h11l5 23h-22zM267 285l-3 9m15-9 5 9"
        stroke="#164e40"
        strokeWidth="3"
        fill="#b57642"
      />
      <circle cx="310" cy="248" r="9" fill="#164e40" />
      <path
        d="M305 260h11l7 26h-23zM304 285l-2 9m14-9 4 9m-37-27 15 8 12-9"
        stroke="#164e40"
        strokeWidth="3"
        fill="#e8b66e"
      />
      <path
        d="m143 103 8-4 7 4m23-15 8-4 7 4"
        stroke="#164e40"
        strokeWidth="2"
      />
    </svg>
  );
}
