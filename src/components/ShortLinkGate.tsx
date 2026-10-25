import { useEffect, useState, useRef } from "react";
import { startAnalytics, trackCampaign, type Campaign } from "../lib/analytics";
export default function ShortLinkGate({
  target,
  measurementId,
  context,
}: {
  target: string;
  measurementId: string;
  context: Campaign;
}) {
  const [message, setMessage] = useState(
    "Wybierz, czy zezwalasz na statystyki tego otwarcia.",
  );
  const navigating = useRef(false);
  function go(analytics: boolean, remember = false) {
    if (navigating.current) return;
    navigating.current = true;
    if (remember) {
      try {
        localStorage.setItem("mp-analytics-consent", analytics ? "yes" : "no");
      } catch {}
    }
    const navigate = () => location.replace(target);
    if (!analytics || !startAnalytics(measurementId)) {
      navigate();
      return;
    }
    setMessage("Otwieram stronę…");
    let finished = false;
    const once = () => {
      if (!finished) {
        finished = true;
        navigate();
      }
    };
    setTimeout(once, 1500); // Continue even if Analytics is blocked or offline.
    trackCampaign(context, once);
  }
  useEffect(() => {
    let choice: string | null = null;
    try {
      choice = localStorage.getItem("mp-analytics-consent");
    } catch {}
    if (choice === "yes" || choice === "no") go(choice === "yes");
  }, []);
  return (
    <section className="follow-box">
      <p role="status" aria-live="polite">
        {message}
      </p>
      <p>
        Za Twoją zgodą Google Analytics zarejestruje otwarcie, oznaczenie linku
        i podstawowe dane urządzenia. Możesz przejść dalej bez statystyk.
      </p>
      <div className="admin-links">
        <button className="button dark" onClick={() => go(true, true)}>
          Otwórz ze statystykami
        </button>
        <button className="button" onClick={() => go(false, true)}>
          Otwórz bez statystyk
        </button>
      </div>
      <p>
        <a href={target} rel="noopener noreferrer nofollow">
          Przejdź bezpośrednio do strony
        </a>{" "}
        · <a href="/polityka-prywatnosci/">Prywatność</a>
      </p>
    </section>
  );
}
