# Mapa Pomocy – MostPomocy

Statyczna strona projektu społecznego **Mapa Pomocy** ([MostPomocy](https://mostpomocy.pl)).

## Struktura plików

```
/index.html             – Strona główna
/mapa/index.html        – Mapa instytucji
/mapa/onkologia/        – Kategoria: onkologia (z listą artykułów)
/bezpiecznik/index.html – Poradnik Bezpiecznik
/kontakt/index.html     – Formularz kontaktowy
/blog/index.html        – Lista artykułów blogowych (Jekyll)
/blog/search.html       – Wyszukiwarka artykułów
/assets/styles.css      – Style (mobile-first, WCAG 2.1 AA + blog)
/assets/app.js          – Minimalne JS (menu, formularz, dostępność)
/assets/search.js       – Wyszukiwarka kliencka (Lunr.js)
/assets/search-index.json – Indeks wyszukiwania (generowany przez Jekyll)
/assets/favicon.svg     – Favicon
/_layouts/default.html  – Bazowy layout Jekyll
/_layouts/post.html     – Layout dla wpisów blogowych
/_includes/             – Komponenty (head, header, footer, a11y-panel)
/_posts/                – Wpisy blogowe (Markdown)
/_posts/template.md     – Szablon kreatora artykułów
/_config.yml            – Konfiguracja Jekyll
/Gemfile                – Ruby dependencies
/robots.txt
/sitemap.xml
```

## Kreator artykułów – jak dodać nowy wpis

### 1. Skopiuj szablon

```bash
cp _posts/template.md _posts/2025-06-15-moj-nowy-artykul.md
```

Nazwa pliku musi mieć format: `YYYY-MM-DD-slug-tytulu.md`

### 2. Wypełnij front matter

Otwórz plik i edytuj sekcję między `---`:

```yaml
---
layout: post
title: "Tytuł Artykułu"          # Wpisz tytuł – zostanie H1 i URL
date: 2025-06-15                  # Data publikacji
category: onkologia               # Jedna kategoria (np. onkologia, rodzina, dzieci)
tags: [pomoc, zdrowie, NFZ]       # Tagi rozdzielone przecinkami
image: /assets/images/obraz.jpg   # Ścieżka do obrazu (obowiązkowy dla SEO)
alt: "Opis obrazu dla czytników"  # Alt tekst – OBOWIĄZKOWY dla dostępności
excerpt: "Krótki opis (do 160 znaków) – pojawi się w listach i meta description."
---
```

### 3. Dodaj obraz

Umieść plik graficzny w katalogu `assets/images/`. Dozwolone formaty: `.jpg`, `.png`, `.webp`.

```
assets/images/
  moj-artykul-hero.jpg   ← minimalna szerokość 800px, proporcje 16:9
```

### 4. Napisz treść w Markdown

Po sekcji `---` pisz treść artykułu w Markdown:

```markdown
Wstęp artykułu...

## Nagłówek sekcji

Treść akapitu.

- Punkt listy 1
- Punkt listy 2

![Opis obrazu](/assets/images/kolejny-obraz.jpg)
```

### 5. Push do GitHub

```bash
git add .
git commit -m "Dodaj artykuł: Tytuł artykułu"
git push
```

GitHub Actions automatycznie zbuduje Jekyll i wdroży stronę (ok. 1–2 min).

### 6. Dostępne kategorie i ich strony

| Kategoria        | URL                          |
|------------------|------------------------------|
| `onkologia`      | `/mapa/onkologia/`           |
| `dzieci`         | `/mapa/dzieci/`              |
| `rodzina`        | `/mapa/rodzina/`             |
| `seniorzy`       | `/mapa/seniorzy/`            |
| `przemoc`        | `/mapa/przemoc/`             |
| `uzaleznienia`   | `/mapa/uzaleznienia/`        |
| `zdrowie`        | `/mapa/zdrowie/`             |

---

## Jak włączyć GitHub Pages z Jekyll

Repozytorium używa **GitHub Actions** do budowania Jekyll i wdrażania strony:

1. Wejdź w **Settings → Pages**.
2. W polu **Source** wybierz **GitHub Actions**.
3. Kliknij **Save**.
4. Przy każdym push do `main` workflow `.github/workflows/deploy.yml` automatycznie buduje i wdraża stronę.

### Lokalne uruchomienie

```bash
bundle install
bundle exec jekyll serve --livereload
```

Strona będzie dostępna pod `http://localhost:4000`.

---

## Podpięcie własnej domeny (mostpomocy.pl)

1. W **Settings → Pages → Custom domain** wpisz `mostpomocy.pl`.
2. U swojego rejestratora domeny dodaj rekord DNS:
   - **CNAME** `www` → `mostpomocy.github.io`
   - **A** (apex) → cztery adresy IP GitHub Pages:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
3. Poczekaj do 24h na propagację DNS.
4. Zaznacz opcję **Enforce HTTPS** po potwierdzeniu certyfikatu.

## Dostępność (WCAG 2.1 AA)

Strona spełnia podstawowe wymagania dostępności:
- Semantyczny HTML5 (`header/nav/main/footer`, poprawna hierarchia `h1–h3`)
- `lang="pl"` na elemencie `<html>`
- Skip-link „Przejdź do treści"
- Widoczny focus (`:focus-visible`) z kontrastującą obwódką
- Kolory z kontrastem ≥ 4.5:1 (tekst) i ≥ 3:1 (elementy UI)
- Responsywność mobile-first
- `prefers-reduced-motion` respektowany
- Alt tekst wymagany w layoucie posta (fallback z tytułu jeśli brak)

---

Projekt tworzony przez wolontariuszy. Treści mają charakter informacyjny
i nie zastępują porady specjalisty.

## Autor

**Igor Pabiańczyk** – student pracy socjalnej na Uniwersytecie Śląskim.

