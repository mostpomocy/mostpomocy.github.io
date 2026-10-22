# MostPomocy — blog na GitHub Pages

Autorski blog o pracy socjalnej i wsparciu. Artykuły ogólnopolskie, katalog instytucji wyłącznie dla Sosnowca. Nowy serwis powstaje z `src/` i `content/`; stare pliki w katalogu głównym pozostają archiwum i nie trafiają do kompilacji.

## Uruchomienie

Node.js 24, `npm ci`, `npm run dev`. Podgląd: http://127.0.0.1:5174, lokalna redakcja: /admin/. `npm test`, `npm run check`, `npm run build` sprawdzają kod i tworzą statyczne `dist/`. `npm run preview` pokazuje dokładnie wydanie produkcyjne, z odnośnikiem do zewnętrznego CMS.

## Publikacja na mostpomocy.pl

1. Po przejrzeniu zmian połącz PR z gałęzią `main`.
2. Repozytorium → Settings → Pages → Build and deployment → Source: **GitHub Actions**. Dotychczasowa publikacja wskazuje gałąź `back`; jest zachowana jako możliwość powrotu.
3. Uruchom workflow „Build and publish MostPomocy”. Po sukcesie sprawdź domenę i HTTPS. `public/CNAME` zawiera `mostpomocy.pl`; DNS istniejącej domeny nie jest zmieniany przez projekt.
4. W [Pages CMS](https://app.pagescms.org) zaloguj się przez GitHub i zainstaluj aplikację z dostępem wyłącznie do `mostpomocy/mostpomocy.github.io`. Wybierz `main`. Uprawnienia zatwierdza właściciel konta; nie są zapisane w kodzie.

## Codzienna edycja bez kodowania

W Pages CMS dostępne są Artykuły, Podstrony, Tagi, Kategorie, Pomoc w Sosnowcu, zdjęcia oraz ustawienia Google. Edytor treści obsługuje formatowanie. Nowe kategorie i tagi przypisujesz do artykułów; ich archiwa powstają automatycznie.

Nowa podstrona: wybierz Podstrony → nowy wpis → tytuł, adres, treść, status i termin publikacji. Opcja „Pokaż w menu głównym” dodaje odnośnik. `blog`, `admin`, `sosnowiec`, `dostepnosc` i inne adresy systemowe są zarezerwowane. Zapis na `main` rozpoczyna publikację, która może potrwać kilka minut. Nieudana walidacja zachowuje poprzednie wydanie online — sprawdź Actions i popraw wskazany wpis.

Szkice i kosz nie trafiają do strony, RSS ani mapy witryny. **W publicznym repozytorium ich pliki i historia nadal są publiczne. Nie przechowuj w nich danych wrażliwych.** Historia edycji w produkcji jest historią Git. Lokalny panel ma własne przywracanie 30 wersji.

Planowane teksty pojawiają się po pierwszej udanej kompilacji po terminie. Workflow uruchamia się co godzinę, ale GitHub może opóźniać harmonogram. Nie jest to publikacja co do minuty. Nie zmieniaj adresów opublikowanych tekstów bez przygotowania przekierowania; GitHub Pages nie obsługuje serwerowych przekierowań 301.

## Google i narzędzia AI

GA4 zachowuje identyfikator `G-YD2QTX4YNR` znaleziony w poprzedniej stronie. Skrypt uruchamia się dopiero po zgodzie czytelnika. Raporty otwierasz we własnym Google Analytics; projekt nie udaje pobranych statystyk i nie publikuje kluczy prywatnych. Odwołanie zgody zatrzymuje dalsze ładowanie; danych zebranych wcześniej nie usuwa z Google.

W Ustawieniach wpisz token Google Search Console/Bing; w Search Console prześlij `https://mostpomocy.pl/sitemap.xml`. Weryfikacja kont i domeny wymaga dostępu właściciela. Strona ma canonical, opisy, Open Graph, dane BlogPosting/WebSite, RSS oraz statyczne HTML dostępne robotom. `llms.txt` to opcjonalny, eksperymentalny spis materiałów, nie gwarancja cytowania przez AI. Google nie wymaga specjalnego pliku AI. Przełącznik spisu nie blokuje crawlerów ani nie usuwa treści z już zbudowanych indeksów.

## Dostępność

Opcje czytania: tekst 100–200%, kontrast, ciemne i ciepłe tło, prosty font, odstępy, linki, ograniczenie ruchu, ukrywanie ilustracji, skupienie na artykule, linia czytania i synteza mowy przeglądarki. Semantyczne nagłówki, formularze z etykietami, skip link i widoczny fokus. Preferencje są lokalne. Nie oznacza to certyfikacji WCAG; przed publikacją i przy nowych treściach potrzebna jest kontrola z czytnikami ekranu, klawiaturą, powiększeniem i na urządzeniach mobilnych. Publiczna informacja: /dostepnosc/.

## Dane

`content/*.json` to źródło treści; `.pages.yml` to konfiguracja Pages CMS. Nie kasuj używanych kategorii/tagów bez poprawienia odniesień: build wykrywa zerwane relacje. Zdjęcia trafiają do `public/uploads/`; opis alternatywny obrazu głównego jest wymagany przez walidację. Pola „źródła” przyjmują po jednym adresie HTTPS w wierszu.

Lokalne `/api/admin` i upload istnieją tylko w serwerze developerskim na loopback, z kontrolą Host/Origin. W `dist` nie ma zapisującego API. Nie udostępniaj serwera developerskiego publicznie. Edycję zdalną autoryzuje Pages CMS/GitHub.
