"use client";
import { useEffect, useState } from "react";
import { startAnalytics, trackLandingCampaign } from "../lib/analytics";
export function Consent({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<string | null>("pending");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      setChoice(localStorage.getItem("mp-analytics-consent"));
    } catch {
      setChoice(null);
    }
  }, []);
  useEffect(() => {
    if (
      choice !== "yes" ||
      !/^G-[A-Z0-9]+$/.test(measurementId) ||
      location.pathname.startsWith("/admin")
    )
      return;
    if (!startAnalytics(measurementId)) return;
    trackLandingCampaign();
    const w = window as any;
    const trackClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest("a") : null;
      const href = target?.getAttribute("href") || "";
      if (href.startsWith("tel:"))
        w.gtag("event", "contact_click", { contact_method: "phone" });
      else if (href.startsWith("mailto:"))
        w.gtag("event", "contact_click", { contact_method: "email" });
      else if (href === "/feed.xml")
        w.gtag("event", "subscribe_interest", { method: "rss" });
    };
    document.addEventListener("click", trackClick);
    return () => {
      document.removeEventListener("click", trackClick);
    };
  }, [choice, measurementId]);
  function choose(value: string) {
    try {
      localStorage.setItem("mp-analytics-consent", value);
    } catch {}
    const revoke = choice === "yes" && value === "no";
    setChoice(value);
    setOpen(false);
    if (revoke) {
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (name.startsWith("_ga")) {
          document.cookie = name + "=;Max-Age=0;path=/";
          document.cookie =
            name + "=;Max-Age=0;path=/;domain=" + location.hostname;
        }
      });
      location.reload();
    }
  }
  if (!measurementId) return null;
  return (
    <>
      {(choice === null || open) && (
        <aside className="consent" aria-label="Ustawienia analityki">
          <strong>Pomóż nam lepiej rozumieć czytelników.</strong>
          <p>
            Za Twoją zgodą Google Analytics zmierzy odwiedziny. Możesz korzystać
            ze strony bez analityki.{" "}
            <a href="/polityka-prywatnosci">Więcej informacji</a>
          </p>
          <button onClick={() => choose("no")}>Bez analityki</button>
          <button onClick={() => choose("yes")}>Zgadzam się</button>
        </aside>
      )}
      <button className="cookie-settings" onClick={() => setOpen(true)}>
        Ustawienia prywatności
      </button>
    </>
  );
}
