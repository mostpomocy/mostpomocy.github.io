export const OFFLINE_CACHE = "mostpomocy-saved-v1";
export const SAVED_KEY = "mp-saved-pages-v1";
export type SavedPage = { url: string; title: string; savedAt: string };
export function savedPages(): SavedPage[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]").filter(
      (p: SavedPage) =>
        /^\/artykuly\/[a-z0-9-]+\/$/.test(p.url) &&
        typeof p.title === "string" &&
        typeof p.savedAt === "string",
    );
  } catch {
    return [];
  }
}
export async function saveArticle(url: string, title: string) {
  if (!("caches" in window))
    throw Error(
      "Ta przeglądarka nie udostępnia pamięci offline. Możesz wydrukować materiał.",
    );
  if (!/^\/artykuly\/[a-z0-9-]+\/$/.test(url))
    throw Error("Do teczki zapisujemy wyłącznie wybrane artykuły.");
  const pending = new Map<string, Response>();
  const queue = [url, "/zapisane/"];
  while (queue.length) {
    const path = queue.shift()!;
    if (pending.has(path)) continue;
    if (pending.size > 100)
      throw Error("Materiał ma zbyt wiele zasobów do zapisania.");
    const response = await fetch(path, { cache: "reload" });
    if (!response.ok)
      throw Error(
        "Nie udało się pobrać wszystkich zasobów. Spróbuj ponownie przy stabilnym połączeniu.",
      );
    pending.set(path, response.clone());
    const type = response.headers.get("content-type") || "";
    const add = (value: string | null) => {
      if (!value) return;
      const u = new URL(value, new URL(path, location.origin));
      if (
        u.origin === location.origin &&
        (/^\/_astro\//.test(u.pathname) ||
          /^\/uploads\//.test(u.pathname) ||
          /^\/fonts\//.test(u.pathname)) &&
        !pending.has(u.pathname)
      )
        queue.push(u.pathname);
    };
    if (type.includes("text/html")) {
      const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      doc
        .querySelectorAll('link[rel="stylesheet"],link[rel="modulepreload"]')
        .forEach((el) => add(el.getAttribute("href")));
      doc
        .querySelectorAll("script[src],img[src]")
        .forEach((el) => add(el.getAttribute("src")));
      doc.querySelectorAll("astro-island").forEach((el) => {
        add(el.getAttribute("component-url"));
        add(el.getAttribute("renderer-url"));
      });
    } else if (type.includes("javascript") || type.includes("text/css")) {
      const text = await response.text();
      for (const match of text.matchAll(
        /["'(]((?:\.\.?\/|\/_astro\/|\/fonts\/)[^"'()\s]+\.(?:js|css|woff2?|png|webp))["')]/g,
      ))
        add(match[1]);
    }
  }
  const cache = await caches.open(OFFLINE_CACHE);
  for (const [path, response] of pending) await cache.put(path, response);
  const next = [
    ...savedPages().filter((p) => p.url !== url),
    { url, title, savedAt: new Date().toISOString() },
  ];
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    throw Error(
      "Przeglądarka zablokowała zapis listy materiałów. Sprawdź ustawienia pamięci.",
    );
  }
  return next;
}
