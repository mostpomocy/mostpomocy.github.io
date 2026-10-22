"use client";
import { useEffect, useState } from "react";
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
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      w.dataLayer.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      script.remove();
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
