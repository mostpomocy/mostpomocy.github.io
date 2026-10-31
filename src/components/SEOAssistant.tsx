import { useState } from 'react';
import { searchDescription } from '../lib/seo.mjs';

export default function SEOAssistant() {
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [message, setMessage] = useState('');
  const description = searchDescription(intro);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${title.trim()}\n\n${description}`);
      setMessage('Skopiowano tytuł i opis. Wklej je do odpowiednich pól w CMS.');
    } catch { setMessage('Nie udało się skopiować. Zaznacz tekst podglądu ręcznie.'); }
  }
  return <section className="related" aria-labelledby="seo-assistant">
    <h2 id="seo-assistant">Asystent SEO</h2>
    <p>Najprościej: wpisz tytuł i wprowadzenie w CMS, a pola SEO zostaw puste. Przy publikacji uzupełnią się automatycznie. Tutaj możesz przygotować i sprawdzić tekst; formularz nie zapisuje zmian w CMS.</p>
    <label htmlFor="seo-title">Tytuł: temat + konkretna potrzeba + miejscowość, jeśli istotna</label>
    <input id="seo-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={180} placeholder="Darmowa pomoc prawna w Sosnowcu – jak się zapisać?" style={{display:'block',width:'100%',padding:12,boxSizing:'border-box',font:'inherit'}} />
    <label htmlFor="seo-intro">Wprowadzenie: co czytelnik znajdzie na tej stronie?</label>
    <textarea id="seo-intro" value={intro} onChange={e => setIntro(e.target.value)} maxLength={2000} rows={4} style={{display:'block',width:'100%',padding:12,boxSizing:'border-box',font:'inherit'}} />
    <div className="content-tile" aria-live="polite">
      <strong>{title || 'Twój tytuł'}</strong>
      <p>{description || 'Twój krótki opis strony'}</p>
      <small>Tytuł: {title.length} znaków. Opis: {description.length} znaków. To orientacyjny podgląd, nie gwarantowany wygląd wyniku Google.</small>
    </div>
    <button className="button" type="button" disabled={!title.trim() || !description} onClick={copy}>Kopiuj tytuł i opis</button>
    <p role="status">{message}</p>
    <details><summary>Lista kontrolna przed publikacją</summary>
      <ul>
        <li>Odpowiedz na pytanie z tytułu na początku tekstu. Nie powtarzaj sztucznie fraz ani literówek.</li>
        <li>Podaj potwierdzone warunki, sposób kontaktu, datę sprawdzenia oraz odnośnik do oficjalnego źródła.</li>
        <li>Dodaj autora, czytelne nagłówki i linki do powiązanych poradników.</li>
        <li>Wstaw własne lub licencjonowane zdjęcie, opisujące temat, i rzeczowy opis alternatywny.</li>
        <li>Nie zaznaczaj „Nie indeksuj”, jeśli treść ma być dostępna w Google. Nie zmieniaj adresu już opublikowanej strony bez przekierowania.</li>
      </ul>
    </details>
    <p><a href="/mapa-strony/">Pełna mapa dla czytelników</a> · <a href="/sitemap.xml">Mapa XML dla Google</a> · <a href="/robots.txt">robots.txt</a></p>
    <p>Mapa aktualizuje się po każdym udanym wdrożeniu treści. Zaplanowane publikacje obsługuje również godzinowy harmonogram. W Search Console wystarczy zgłosić sitemap.xml raz; nie trzeba zgłaszać każdej nowej strony osobno.</p>
    <p><a href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide">Poradnik Google</a> · <a href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap">Zasady map witryny</a></p>
  </section>;
}
