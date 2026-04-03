# Mapa Pomocy – MostPomocy

Statyczna strona projektu społecznego **Mapa Pomocy** ([MostPomocy](https://mostpomocy.pl)).

Strona używa **Jekyll** – systemu szablonów wbudowanego w GitHub Pages. Dzięki temu header, footer i menu edytujesz w jednym miejscu, a każda nowa podstrona to tylko kilkanaście linii kodu.

## Struktura plików

```
/_layouts/default.html    – Szablon strony (header + menu + footer)
/_templates/              – Pliki szablonów – kopiuj stąd nowe podstrony
/index.html               – Strona główna
/mapa/index.html          – Mapa instytucji (w przygotowaniu)
/bezpiecznik/index.html   – Poradnik Bezpiecznik
/kontakt/index.html       – Formularz kontaktowy
/assets/styles.css        – Style (mobile-first, WCAG 2.1 AA)
/assets/app.js            – Minimalne JS (menu, formularz)
/assets/favicon.svg       – Favicon
/_config.yml              – Konfiguracja Jekyll (tytuł, URL strony)
/robots.txt
/sitemap.xml
```

---

## ➕ Jak dodać nową podstronę

### Krok 1 – Utwórz folder i plik

Skopiuj plik `_templates/nowa-podstrona.html` do nowego folderu.  
Przykład: chcesz dodać stronę „Artykuły" → utwórz plik `artykuly/index.html`.

### Krok 2 – Wypełnij nagłówek (frontmatter)

Na początku pliku zmień wartości między `---`:

```yaml
---
layout: default
title: "Artykuły | Mapa Pomocy"
description: "Opis strony dla Google (do 160 znaków)."
og_title: "Artykuły | Mapa Pomocy"
og_description: "Opis do udostępniania w mediach społecznościowych."
breadcrumb: "Artykuły"
---
```

| Pole | Co wpisać |
|---|---|
| `title` | Tytuł zakładki przeglądarki i wynik Google |
| `description` | Opis widoczny w Google pod tytułem (do 160 znaków) |
| `og_title` | Tytuł przy udostępnianiu w social media |
| `og_description` | Opis przy udostępnianiu w social media |
| `breadcrumb` | Tekst w ścieżce nawigacji (np. „Artykuły") – usuń tę linię, jeśli nie chcesz breadcrumbu |

### Krok 3 – Napisz treść

Pod `---` wpisz zawartość strony – tylko sekcje `<section>`, bez `<html>`, `<head>`, `<header>` ani `<footer>`. Te elementy wstawiają się automatycznie z `_layouts/default.html`.

```html
<section class="section" aria-labelledby="heading">
  <div class="section-inner container">
    <h1 id="heading" class="section-title">Tytuł</h1>
    <p>Treść...</p>
  </div>
</section>
```

### Krok 4 – Dodaj do menu (opcjonalnie)

Jeśli nowa strona ma się pojawić w górnym menu, edytuj `_layouts/default.html` i dodaj nową pozycję w `<nav>`:

```html
<li><a href="/artykuly/" {% if page.url contains '/artykuly' %}aria-current="page"{% endif %}>Artykuły</a></li>
```

### Krok 5 – Dodaj do sitemapy

Otwórz `sitemap.xml` i dodaj nowy wpis:

```xml
<url>
  <loc>https://mapapomocy.pl/artykuly/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### Krok 6 – Commit i push

Wgraj zmiany na GitHub (gałąź `main`) – GitHub Pages automatycznie zbuduje stronę w ciągu 1–2 minut.

---

## Jak włączyć GitHub Pages

1. Wejdź w **Settings** repozytorium na GitHub.
2. W sekcji **Pages** (lewy pasek: *Code and automation → Pages*).
3. W polu **Source** wybierz gałąź `main` i folder `/ (root)`.
4. Kliknij **Save**.
5. Po chwili (1–2 min) strona będzie dostępna pod adresem:
   `https://[organizacja].github.io/[nazwa-repo]/`
   lub – po skonfigurowaniu domeny – pod `https://mapapomocy.pl/`.

## Podpięcie własnej domeny (mapapomocy.pl)

1. W **Settings → Pages → Custom domain** wpisz `mapapomocy.pl`.
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

## Formspree (formularz kontaktowy)

Formularz na stronie `/kontakt/` używa serwisu [Formspree](https://formspree.io).

1. Załóż konto na formspree.io i utwórz nowy formularz.
2. Skopiuj endpoint (np. `https://formspree.io/f/abcdefgh`).
3. W pliku `kontakt/index.html` zamień:
   ```
   action="https://formspree.io/f/TWOJ_ENDPOINT"
   ```
   na swój endpoint.

Plan bezpłatny Formspree pozwala na 50 wiadomości miesięcznie.

## Dostępność (WCAG 2.1 AA)

Strona spełnia podstawowe wymagania dostępności:
- Semantyczny HTML5 (`header/nav/main/footer`, poprawna hierarchia `h1–h3`)
- `lang="pl"` na elemencie `<html>`
- Skip-link „Przejdź do treści"
- Widoczny focus (`:focus-visible`) z kontrastującą obwódką
- Kolory z kontrastem ≥ 4.5:1 (tekst) i ≥ 3:1 (elementy UI)
- Responsywność mobile-first (bez mediów breakpoints powyżej 640px)
- `prefers-reduced-motion` respektowany
- Linki do telefonów z etykietami `aria-label`
- Formularz z powiązanymi `label` i opisami `aria-describedby`

## Etap 2 – Interaktywna mapa

Planowane rozszerzenie o:
- [Leaflet.js](https://leafletjs.com/) + OpenStreetMap
- Dane w `data/places.json`
- Filtry po kategorii i wyszukiwanie po miejscowości
- Lista wyników dostępna z klawiatury (mapa jako uzupełnienie)

---

Projekt tworzony przez wolontariuszy. Treści mają charakter informacyjny
i nie zastępują porady specjalisty.

## Autor

**Igor Pabiańczyk** – student pracy socjalnej na Uniwersytecie Śląskim.
