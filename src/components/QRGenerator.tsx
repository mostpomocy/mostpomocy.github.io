import { useState } from "react";
import { buildQRLink, qrSVG, qrLabel } from "../lib/qr.mjs";
interface Target {
  path: string;
  title: string;
}
export default function QRGenerator({
  targets,
  reportUrl,
}: {
  targets: Target[];
  reportUrl: string;
}) {
  const [target, setTarget] = useState(
    targets.find((t) => t.path.includes("wolontariat-mops"))?.path || "/",
  );
  const [source, setSource] = useState("mops_sosnowiec");
  const [campaign, setCampaign] = useState("mostpomocy_2026");
  const [code, setCode] = useState("plakat_mops_01");
  const [notice, setNotice] = useState("");
  let link = "",
    svg = "",
    error = "";
  try {
    link = buildQRLink(
      { target, source, campaign, code },
      targets.map((t) => t.path),
    );
    svg = qrSVG(link);
  } catch (e) {
    error = (e as Error).message;
  }
  const filename = "mostpomocy-" + (qrLabel(code) || "qr");
  function download(blob: Blob, suffix: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename + suffix;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function png() {
    if (!svg) return;
    try {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const objectURL = URL.createObjectURL(blob);
      const image = new Image();
      try {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = reject;
          image.src = objectURL;
        });
      } finally {
        URL.revokeObjectURL(objectURL);
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1024;
      canvas.getContext("2d")!.drawImage(image, 0, 0, 1024, 1024);
      canvas.toBlob((result) => {
        if (result) download(result, ".png");
        else setNotice("Nie udało się zapisać PNG. Pobierz SVG.");
      }, "image/png");
    } catch {
      setNotice(
        "Ta przeglądarka nie obsługuje konwersji. Pobierz SVG do druku.",
      );
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Link skopiowany.");
    } catch {
      setNotice("Zaznacz i skopiuj link z pola poniżej.");
    }
  }
  return (
    <div className="qr-tool">
      <div className="qr-fields">
        <label htmlFor="qr-target">Dokąd ma prowadzić kod?</label>
        <select
          id="qr-target"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setNotice("");
          }}
        >
          {targets.map((t) => (
            <option key={t.path} value={t.path}>
              {t.title}
            </option>
          ))}
        </select>
        <label htmlFor="qr-source">Miejsce lub źródło</label>
        <input
          id="qr-source"
          maxLength={80}
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setNotice("");
          }}
          aria-describedby="qr-source-help"
        />
        <small id="qr-source-help">
          Np. mops_sosnowiec, biblioteka, szkola. Użyj nazwy miejsca, nie danych
          osoby.
        </small>
        <label htmlFor="qr-campaign">Kampania</label>
        <input
          id="qr-campaign"
          maxLength={80}
          value={campaign}
          onChange={(e) => {
            setCampaign(e.target.value);
            setNotice("");
          }}
        />
        <small>
          Np. wolontariat_jesien_2026. Ta sama nazwa łączy materiały jednej
          akcji.
        </small>
        <label htmlFor="qr-code">Oznaczenie tego kodu</label>
        <input
          id="qr-code"
          maxLength={80}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setNotice("");
          }}
        />
        <small>
          Np. plakat_wejscie_01 lub ulotka_02. Nadaj inne oznaczenie każdemu
          miejscu dystrybucji.
        </small>
      </div>
      <div className="qr-preview">
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <>
            <img
              src={
                "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
              }
              width="320"
              height="320"
              alt={"Kod QR: " + targets.find((t) => t.path === target)?.title}
            />
            <div className="qr-actions">
              <button className="button" onClick={png}>
                Pobierz PNG
              </button>
              <button
                className="button"
                onClick={() =>
                  download(new Blob([svg], { type: "image/svg+xml" }), ".svg")
                }
              >
                Pobierz SVG do druku
              </button>
            </div>
          </>
        )}
        <p>
          Sprawdź kod aparatem telefonu przed drukiem. Zachowaj biały margines i
          czytelny rozmiar.
        </p>
      </div>
      <div className="qr-link">
        <label htmlFor="qr-link">Adres zapisany w kodzie</label>
        <textarea id="qr-link" readOnly rows={4} value={link} />
        <button className="button" disabled={!link} onClick={copy}>
          Kopiuj link
        </button>
        <p role="status" aria-live="polite">
          {notice}
        </p>
      </div>
      <section className="qr-guide">
        <h2>Gdzie zobaczę wyniki?</h2>
        <p>
          W raporcie Google Analytics sprawdzisz kampanię, miejsce dystrybucji,
          oznaczenie kodu, wizyty i urządzenia. Dane są prywatne — potrzebujesz
          dostępu do usługi MostPomocy.
        </p>
        <a
          className="button dark"
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Otwórz statystyki QR w Google Analytics ↗
        </a>
        <p>
          Statystyki dotyczą wejść na stronę, a nie samego skanowania aparatem.
          Odmowa zgody, blokowanie Analytics i przekazanie linku innej osobie
          wpływają na wyniki. Miasto jest przybliżone. Oznaczenia identyfikują
          materiał, nie człowieka.
        </p>
      </section>
    </div>
  );
}
