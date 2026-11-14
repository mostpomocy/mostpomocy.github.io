import { useState, useEffect } from "react";
type Row = {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
};
export default function GoogleReports({
  clientId,
  propertyId,
  siteUrl,
}: {
  clientId: string;
  propertyId: string;
  siteUrl: string;
}) {
  const [client, setClient] = useState(clientId),
    [property, setProperty] = useState(propertyId),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [gaMessage, setGaMessage] = useState(""),
    [searchMessage, setSearchMessage] = useState(""),
    [stats, setStats] = useState<string[]>([]),
    [top, setTop] = useState<Row[]>([]),
    [campaigns, setCampaigns] = useState<Row[]>([]),
    [campaignMessage, setCampaignMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState<any[]>([]);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () =>
      setMessage("Nie udało się wczytać logowania Google. Sprawdź połączenie.");
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  const api = async (url: string, body: any, token: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok)
      throw Error(result?.error?.message || `Błąd HTTP ${response.status}`);
    if (!result) throw Error("Google zwróciło niepoprawną odpowiedź.");
    return result;
  };
  async function loadAnalytics(token: string) {
    try {
      const base =
        "https://analyticsdata.googleapis.com/v1beta/properties/" +
        property +
        ":runReport";
      const report = await api(
        base,
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
          ],
        },
        token,
      );
      setStats(
        report.rows?.[0]?.metricValues?.map((v: any) => v.value) || [
          "0",
          "0",
          "0",
        ],
      );
      const pages = await api(
        base,
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        },
        token,
      );
      setTop(pages.rows || []);
      try {
        const activity = await api(
          base,
          {
            dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
            dimensions: [
              { name: "pagePath" },
              { name: "deviceCategory" },
              { name: "operatingSystem" },
              { name: "browser" },
              { name: "city" },
            ],
            metrics: [{ name: "eventCount" }],
            dimensionFilter: {
              filter: {
                fieldName: "eventName",
                stringFilter: { matchType: "EXACT", value: "campaign_open" },
              },
            },
            orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
            limit: 100,
          },
          token,
        );
        setCampaigns(activity.rows || []);
        setCampaignMessage(
          activity.rows?.length
            ? "Zarejestrowane otwarcia po zgodzie na Analytics. Zdarzenie campaign_open; ostatnie 28 dni z dzisiaj."
            : "Brak przetworzonych otwarć linków i QR w tym okresie. Nowe zdarzenia sprawdzisz najpierw w raporcie czasu rzeczywistego.",
        );
      } catch (e) {
        setCampaignMessage("Raport linków: " + (e as Error).message);
      }
      setGaMessage(
        report.rows?.length
          ? "GA4: ostatnie 28 dni."
          : "GA4 nie zwróciło odsłon za ostatnie 28 dni. Sprawdź test pomiaru na żywo.",
      );
    } catch (e) {
      setGaMessage("GA4: " + (e as Error).message);
    }
  }
  async function loadSearch(token: string) {
    try {
      const end = new Date(Date.now() - 3 * 86400000)
        .toISOString()
        .slice(0, 10);
      const start = new Date(Date.now() - 30 * 86400000)
        .toISOString()
        .slice(0, 10);
      const origin = new URL(siteUrl);
      const errors: string[] = [];
      for (const resource of [
        origin.origin + "/",
        "sc-domain:" + origin.hostname,
      ]) {
        try {
          const results = await api(
            "https://www.googleapis.com/webmasters/v3/sites/" +
              encodeURIComponent(resource) +
              "/searchAnalytics/query",
            {
              startDate: start,
              endDate: end,
              dimensions: ["page"],
              rowLimit: 10,
            },
            token,
          );
          setSearch(results.rows || []);
          setSearchMessage(
            results.rows?.length
              ? "Search Console: pobrano dane."
              : "Search Console: brak wyników w wybranym okresie.",
          );
          return;
        } catch (e) {
          errors.push((e as Error).message);
        }
      }
      throw Error([...new Set(errors)].join(" / "));
    } catch (e) {
      setSearchMessage("Search Console: " + (e as Error).message);
    }
  }
  function connect() {
    if (
      !/^\d+$/.test(property) ||
      !client.trim().endsWith(".apps.googleusercontent.com")
    ) {
      setMessage(
        "Wpisz poprawny numer usługi oraz publiczny OAuth Client ID aplikacji internetowej.",
      );
      return;
    }
    const g = (window as any).google;
    if (!g?.accounts?.oauth2) {
      setMessage("Poczekaj na wczytanie Google lub sprawdź blokadę skryptów.");
      return;
    }
    setBusy(true);
    setMessage("Otwieram logowanie Google…");
    setGaMessage("");
    setSearchMessage("");
    setCampaignMessage("");
    setStats([]);
    setTop([]);
    setCampaigns([]);
    setSearch([]);
    const analyticsScope = "https://www.googleapis.com/auth/analytics.readonly";
    const searchScope = "https://www.googleapis.com/auth/webmasters.readonly";
    const fail = (text: string) => {
      setMessage(text);
      setBusy(false);
    };
    try {
      const oauth = g.accounts.oauth2.initTokenClient({
        client_id: client.trim(),
        scope: analyticsScope + " " + searchScope,
        callback: async (response: any) => {
          if (!response.access_token) {
            fail(
              "Google nie udzieliło dostępu: " +
                (response.error_description ||
                  response.error ||
                  "brak tokenu") +
                ".",
            );
            return;
          }
          setMessage("Pobieram prywatne raporty z Google…");
          const jobs: Promise<void>[] = [];
          if (g.accounts.oauth2.hasGrantedAllScopes(response, analyticsScope))
            jobs.push(loadAnalytics(response.access_token));
          else setGaMessage("GA4: nie udzielono zgody na odczyt raportów.");
          if (g.accounts.oauth2.hasGrantedAllScopes(response, searchScope))
            jobs.push(loadSearch(response.access_token));
          else
            setSearchMessage(
              "Search Console: nie udzielono zgody na odczyt raportów.",
            );
          await Promise.allSettled(jobs);
          setBusy(false);
          setMessage("");
        },
        error_callback: (error: any) =>
          fail(
            error.type === "popup_closed"
              ? "Okno logowania zostało zamknięte. Możesz spróbować ponownie."
              : "Nie udało się otworzyć logowania. Zezwól na wyskakujące okna i sprawdź autoryzowane źródło " +
                  location.origin +
                  " w Google Cloud.",
          ),
      });
      oauth.requestAccessToken();
    } catch {
      fail("Nie udało się rozpocząć logowania Google. Sprawdź Client ID.");
    }
  }
  return (
    <section className="follow-box" aria-labelledby="google-reports-heading">
      <h2 id="google-reports-heading">Twoje raporty Google</h2>
      <p>
        Rzeczywiste dane z GA4 i Search Console po zalogowaniu. Raporty i token
        dostępu pozostają w pamięci tej przeglądarki; nie publikujemy ich w
        repozytorium.
      </p>
      <details>
        <summary>Ustaw połączenie z Google</summary>
        <p>
          W Google Cloud włącz Analytics Data API i Search Console API, utwórz
          klienta OAuth typu „aplikacja internetowa” i dodaj autoryzowane źródło
          https://mostpomocy.pl. Wklej publiczny Client ID oraz numer usługi GA4
          w ustawieniach Pages CMS albo poniżej. To jednorazowa konfiguracja
          właściciela. Nie wpisuj klucza prywatnego ani Client Secret.
        </p>
        <label>
          Publiczny Google OAuth Client ID
          <input
            value={client}
            onChange={(e) => {
              setClient(e.target.value);
            }}
            autoComplete="off"
            disabled={busy}
          />
        </label>
        <label>
          Numer usługi GA4
          <input
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            inputMode="numeric"
            disabled={busy}
          />
        </label>
      </details>
      <button
        className="button dark"
        onClick={connect}
        disabled={!ready || busy}
      >
        Zaloguj w Google i pobierz raporty
      </button>
      {!client && (
        <p>
          Połączenie API czeka na publiczny Client ID. Zgoda na pomiar odsłon
          jest ustawiana osobno na stronie.
        </p>
      )}
      <p role="status">{message}</p>
      <p role="status">{gaMessage}</p>
      <p role="status">{searchMessage}</p>
      <p>
        <a href="/" target="_blank" rel="noopener noreferrer">
          Otwórz stronę do testu pomiaru ↗
        </a>
        {" · "}
        <a
          href={
            /^\d+$/.test(property)
              ? "https://analytics.google.com/analytics/web/#/p" +
                property +
                "/realtime/overview"
              : "https://analytics.google.com/"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Pomiar na żywo w GA4 ↗
        </a>
      </p>
      <p>
        Na otwartej stronie wybierz „Zgadzam się” w ustawieniach prywatności.
        Następnie sprawdź, czy w pomiarze na żywo pojawiła się odsłona. Jeśli
        przeglądarka blokuje tag Google, powtórz test bez blokady.
      </p>
      <p>
        <a href="/linki/">Zarządzaj krótkimi linkami i raportami QR →</a>
      </p>
      {campaignMessage && <p role="status">{campaignMessage}</p>}
      {campaigns.length > 0 && (
        <div className="report-table-wrap">
          <h3>Otwarcia krótkich linków i QR</h3>
          <table className="report-table">
            <thead>
              <tr>
                {[
                  "Strona / krótki adres",
                  "Urządzenie",
                  "System",
                  "Przeglądarka",
                  "Miasto (przybliżone)",
                  "Otwarcia",
                ].map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((r, i) => (
                <tr key={i}>
                  {r.dimensionValues?.map((v, j) => (
                    <td key={j}>{v.value}</td>
                  ))}
                  <td>{r.metricValues?.[0]?.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {stats.length > 0 && (
        <div className="dashboard-stats">
          {["Aktywni użytkownicy", "Sesje", "Odsłony"].map((name, i) => (
            <div className="dashboard-stat" key={name}>
              <strong>{Number(stats[i]).toLocaleString("pl-PL")}</strong>
              <span>{name} · 28 dni</span>
            </div>
          ))}
        </div>
      )}
      {top.length > 0 && (
        <div className="report-table-wrap">
          <h3>Najczęściej czytane strony</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Strona</th>
                <th>Odsłony</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r, i) => (
                <tr key={i}>
                  <td>{r.dimensionValues?.[0]?.value}</td>
                  <td>{r.metricValues?.[0]?.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {search.length > 0 && (
        <div className="report-table-wrap">
          <h3>Wyniki Google Search Console</h3>
          <p>
            Dane za 28 dni, do trzech dni przed dzisiaj. Nowsze dane Google mogą
            być jeszcze niekompletne.
          </p>
          <table className="report-table">
            <thead>
              <tr>
                <th>Strona</th>
                <th>Kliknięcia</th>
                <th>Wyświetlenia</th>
              </tr>
            </thead>
            <tbody>
              {search.map((r, i) => (
                <tr key={i}>
                  <td>{r.keys?.[0]}</td>
                  <td>{r.clicks}</td>
                  <td>{r.impressions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
