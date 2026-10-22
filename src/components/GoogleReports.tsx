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
    [stats, setStats] = useState<string[]>([]),
    [top, setTop] = useState<Row[]>([]),
    [search, setSearch] = useState<any[]>([]);
  useEffect(() => {
    if (!client.endsWith(".apps.googleusercontent.com")) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () =>
      setMessage("Nie udało się wczytać logowania Google. Sprawdź połączenie.");
    document.head.appendChild(script);
    return () => script.remove();
  }, [client]);
  const api = async (url: string, body: any, token: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok)
      throw Error(result.error?.message || "Błąd pobierania raportu");
    return result;
  };
  async function load(token: string) {
    setMessage("Pobieram prywatne raporty z Google…");
    try {
      const base =
        "https://analyticsdata.googleapis.com/v1beta/properties/" +
        property +
        ":runReport";
      const report = await api(
        base,
        {
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
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
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        },
        token,
      );
      setTop(pages.rows || []);
      setMessage(
        "GA4: ostatnie 28 dni. Dane widzisz tylko w tej sesji przeglądarki.",
      );
      try {
        const end = new Date(Date.now() - 3 * 86400000)
            .toISOString()
            .slice(0, 10),
          start = new Date(Date.now() - 31 * 86400000)
            .toISOString()
            .slice(0, 10);
        let results: any = null;
        for (const resource of [
          siteUrl + "/",
          "sc-domain:" + new URL(siteUrl).hostname,
        ]) {
          try {
            results = await api(
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
            break;
          } catch {}
        }
        if (!results) throw Error("Brak dostępu do Search Console");
        setSearch(results.rows || []);
      } catch {
        setMessage(
          "Raport GA4 pobrany. Search Console: sprawdź dostęp do usługi typu prefiks URL " +
            siteUrl +
            "/ lub do usługi domenowej. Otwórz bezpośredni raport Google, aby sprawdzić uprawnienia.",
        );
      }
    } catch (e) {
      setMessage("Nie pobrano danych: " + (e as Error).message);
    }
  }
  function connect() {
    if (
      !/^\d+$/.test(property) ||
      !client.endsWith(".apps.googleusercontent.com")
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
    const oauth = g.accounts.oauth2.initTokenClient({
      client_id: client,
      scope:
        "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly",
      callback: (response: any) =>
        response.access_token
          ? load(response.access_token)
          : setMessage(
              "Google nie udzieliło dostępu. Możesz nadal otworzyć raporty w Google.",
            ),
      error_callback: () =>
        setMessage("Logowanie przerwane. Żadne dane nie zostały pobrane."),
    });
    oauth.requestAccessToken();
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
              setReady(false);
              setClient(e.target.value);
            }}
            autoComplete="off"
          />
        </label>
        <label>
          Numer usługi GA4
          <input
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            inputMode="numeric"
          />
        </label>
      </details>
      <button
        className="button dark"
        onClick={connect}
        disabled={!ready || !property}
      >
        Zaloguj w Google i pobierz raporty
      </button>
      {!client && (
        <p>
          Połączenie API czeka na publiczny Client ID. Obecne śledzenie GA4
          działa niezależnie od tego raportu, po zgodzie czytelnika.
        </p>
      )}
      <p role="status">{message}</p>
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
