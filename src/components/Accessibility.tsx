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
  const root = useRef<HTMLDetailsElement>(null);
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
        root.current.open = false;
        root.current.querySelector("summary")?.focus();
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
      <details className="reading-tools accessibility-tools" ref={root}>
        <summary>
          Dostępność <span aria-hidden="true">Aa</span>
        </summary>
        <div aria-label="Dostosuj czytanie">
          <strong>Dostosuj stronę do siebie</strong>
          <p>
            Ustawienia zapisują się tylko w tej przeglądarce. Menu zamkniesz
            klawiszem Escape.
          </p>
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
          {speech && (
            <button type="button" onClick={read}>
              {speaking ? "Zatrzymaj odczyt" : "Odczytaj tekst przeglądarką"}
            </button>
          )}
          <button
            type="button"
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
      </details>
      {prefs.ruler && <div className="reading-ruler" aria-hidden="true" />}
    </>
  );
}
