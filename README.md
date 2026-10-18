# MostPomocy.pl

Nowoczesny, statyczny portal społeczny oparty na **Astro** i **GitHub Pages**. Projekt wykorzystuje **Astro Content Collections** oraz **Pages CMS** (konfiguracja w `.pages.yml`) do wygodnej edycji treści przez osoby nietechniczne.

## Architektura

- `src/pages/` – routing Astro (strona główna, wsparcie, blog, Sosnowiec, admin, strony informacyjne)
- `src/components/` – komponenty wielokrotnego użytku (Header, Footer, Hero, EmergencyBanner, SupportCard, SupportGrid, ArticleCard, ArticleGrid, Breadcrumbs, Callout, CTA, LocalHelpCard, SectionHeader)
- `src/content/` – kolekcje treści:
  - `blog-polska`
  - `blog-sosnowiec`
  - `wsparcie`
  - `miasta` (obecnie `sosnowiec`, gotowe pod kolejne miasta)
- `.pages.yml` – konfiguracja Pages CMS i formularzy redakcyjnych
- `.github/workflows/deploy.yml` – build i deploy na GitHub Pages po zmianie na `main`

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Build produkcyjny:

```bash
npm run build
```

## Edycja treści (Pages CMS)

Panel CMS: `https://app.pagescms.org/` (link także na `/admin/`).

W CMS znajdują się sekcje:
- MostPomocy CMS
- Blog ogólnopolski
- Blog Sosnowiec
- Rodzaje wsparcia
- Sosnowiec
- Strony
- Ustawienia serwisu
- Media

### Dodawanie artykułów

Dodaj wpis w kolekcji **Blog ogólnopolski** lub **Blog Sosnowiec**. Formularz obejmuje:
- tytuł, slug, opis,
- datę publikacji i aktualizacji,
- autora, kategorię, tagi,
- zdjęcie wyróżniające i alt,
- SEO title + SEO description,
- status szkic/opublikowany,
- treść artykułu (rich-text).

### Dodawanie kategorii wsparcia

Dodanie nowego pliku w `src/content/wsparcie/` (lub wpisu w CMS) automatycznie tworzy nową stronę `/wsparcie/{slug}/`.

## Publikacja

Workflow `.github/workflows/deploy.yml` uruchamia:
1. `npm install`
2. `npm run build`
3. publikację artefaktu `dist/` na GitHub Pages

Repozytorium zawiera `CNAME` z domeną `mostpomocy.pl`. Jeśli docelowo ma działać `www.mostpomocy.pl`, ustaw przekierowanie DNS i/lub wartość CNAME zgodnie z konfiguracją domeny u rejestratora.

## Ograniczenia i rzeczy do dalszej weryfikacji

- Dane kontaktowe placówek zostały zostawione jako struktury „do uzupełnienia”, bez wprowadzania niezweryfikowanych numerów/adresów.
- Przed publikacją operacyjną należy potwierdzić wszystkie lokalne dane instytucji oraz politykę prywatności pod kątem finalnych narzędzi analitycznych/formularzy.
