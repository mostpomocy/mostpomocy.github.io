import { useEffect, useRef, useState } from "react";
const defaults = {
  scale: 1,
  contrast: "normal",
  font: "default",
  spacing: "normal",
  links: false,
  motion: false,
  images: false,
  reading: false,
  ruler: false,
};
export function Accessibility() {
  const [prefs, setPrefs] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speech, setSpeech] = useState(false);
  const [status, setStatus] = useState("");
  const root = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const dialog = root.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mp-reading-v2") || "null");
      if (saved)
        setPrefs({
          ...defaults,
          ...saved,
          scale: [1, 1.25, 1.5, 1.75, 2].includes(saved.scale)
            ? saved.scale
            : 1,
        });
    } catch {}
    setReady(true);
    setSpeech("speechSynthesis" in window);
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && root.current?.open) {
        root.current.close();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.style.setProperty("--text-scale", String(prefs.scale));
    for (const [key, value] of Object.entries(prefs))
      html.dataset["a11y" + key[0].toUpperCase() + key.slice(1)] =
        String(value);
    try {
      localStorage.setItem("mp-reading-v2", JSON.stringify(prefs));
    } catch {}
  }, [prefs, ready]);
  function update(key: string, value: any) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setStatus("Zmieniono ustawienie czytania");
  }
  function read() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text =
      window.getSelection()?.toString().trim() ||
      document.querySelector(".prose")?.textContent ||
      document.querySelector("#main")?.textContent ||
      "";
    const voice = new SpeechSynthesisUtterance(text.slice(0, 25000));
    voice.lang = "pl-PL";
    voice.voice =
      window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith("pl") && v.localService) || null;
    voice.onend = () => setSpeaking(false);
    voice.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(voice);
    setSpeaking(true);
  }
  return (
    <>
      <button
        className="a11y-trigger"
        ref={trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path
            d="m4 8 8 2 8-2M12 10v5m0 0-5 7m5-7 5 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Dostępność
      </button>
      <dialog
        className="a11y-dialog"
        ref={root}
        aria-labelledby="a11y-title"
        onCancel={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <header className="a11y-heading">
          <div>
            <span className="eyebrow">CZYTAJ PO SWOJEMU</span>
            <h2 id="a11y-title">Dostosuj stronę</h2>
          </div>
          <button
            type="button"
            className="a11y-close"
            aria-label="Zamknij panel dostępności"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>
        <div className="a11y-content">
          <div className="a11y-presets" aria-label="Szybkie ustawienia">
            <button
              type="button"
              onClick={() => {
                setPrefs({
                  ...defaults,
                  scale: 1.25,
                  font: "simple",
                  spacing: "comfortable",
                  links: true,
                });
                setStatus("Włączono łatwiejsze czytanie");
              }}
            >
              Łatwiejsze czytanie
            </button>
            <button
              type="button"
              onClick={() => {
                setPrefs((p) => ({ ...p, contrast: "high", links: true }));
                setStatus("Włączono wysoki kontrast");
              }}
            >
              Wysoki kontrast
            </button>
            <button
              type="button"
              onClick={() => {
                setPrefs((p) => ({ ...p, scale: 1.5 }));
                setStatus("Powiększono tekst do 150%");
              }}
            >
              Większy tekst
            </button>
          </div>
          <p>
            Ustawienia zapisują się tylko w tej przeglądarce. Menu zamkniesz
            klawiszem Escape.
          </p>
          <fieldset>
            <legend>Tekst i kolory</legend>
            <div className="a11y-selects">
              <label htmlFor="a11y-scale">
                Wielkość tekstu
                <select
                  aria-label="Wielkość tekstu"
                  id="a11y-scale"
                  value={prefs.scale}
                  onChange={(e) => update("scale", Number(e.target.value))}
                >
                  {[1, 1.25, 1.5, 1.75, 2].map((v) => (
                    <option value={v} key={v}>
                      {v * 100}%
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="a11y-contrast">
                Kolory i kontrast
                <select
                  aria-label="Kolory i kontrast"
                  id="a11y-contrast"
                  value={prefs.contrast}
                  onChange={(e) => update("contrast", e.target.value)}
                >
                  <option value="normal">Domyślne</option>
                  <option value="high">Wysoki kontrast</option>
                  <option value="dark">Ciemne tło</option>
                  <option value="sepia">Ciepłe tło — sepia</option>
                </select>
              </label>
              <label htmlFor="a11y-font">
                Krój pisma
                <select
                  aria-label="Krój pisma"
                  id="a11y-font"
                  value={prefs.font}
                  onChange={(e) => update("font", e.target.value)}
                >
                  <option value="default">Domyślny</option>
                  <option value="simple">Prosty, bezszeryfowy</option>
                </select>
              </label>
              <label htmlFor="a11y-spacing">
                Odstępy w tekście
                <select
                  aria-label="Odstępy w tekście"
                  id="a11y-spacing"
                  value={prefs.spacing}
                  onChange={(e) => update("spacing", e.target.value)}
                >
                  <option value="normal">Domyślne</option>
                  <option value="comfortable">Większe</option>
                  <option value="wide">Bardzo duże</option>
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Spokojniejszy widok</legend>
            {[
              ["links", "Podkreśl wszystkie linki"],
              ["motion", "Ogranicz ruch i animacje"],
              ["images", "Ukryj ilustracje"],
              ["reading", "Skup się na treści artykułu"],
              ["ruler", "Pokaż linię ułatwiającą czytanie"],
            ].map(([key, label]) => (
              <label className="a11y-check" key={key}>
                <input
                  type="checkbox"
                  aria-label={label}
                  checked={!!prefs[key as keyof typeof defaults]}
                  onChange={(e) => update(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Odsłuchaj treść</legend>
            {speech && (
              <button type="button" onClick={read}>
                {speaking ? "Zatrzymaj odczyt" : "Odczytaj tekst przeglądarką"}
              </button>
            )}
            {!speech && (
              <p>
                Ta przeglądarka nie udostępnia odczytu głosowego. Możesz użyć
                czytnika ekranu swojego urządzenia.
              </p>
            )}
          </fieldset>
          <button
            type="button"
            className="a11y-reset"
            onClick={() => {
              setPrefs(defaults);
              window.speechSynthesis?.cancel();
              setSpeaking(false);
              setStatus("Przywrócono domyślne ustawienia");
            }}
          >
            Przywróć domyślne ustawienia
          </button>
          <a href="/dostepnosc/">Informacje o dostępności</a>
          <span className="sr-only" role="status">
            {status}
          </span>
        </div>
      </dialog>
      {prefs.ruler && <div className="reading-ruler" aria-hidden="true" />}
    </>
  );
}
