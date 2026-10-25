export const campaignReportURL =
  "https://analytics.google.com/analytics/web/#/analysis/a389862968p531159356/edit/UXaAE-XkSHOqHHa0lUNxUA";
export function safeDestination(value) {
  if (typeof value !== "string" || !value.trim() || /^\s*\/\//.test(value))
    throw Error("Podaj pełny adres HTTPS lub /adres/ na MostPomocy.");
  const url = new URL(value.trim(), "https://mostpomocy.pl");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname.includes(".")
  )
    throw Error(
      "Adres musi używać HTTPS i nie może zawierać danych logowania.",
    );
  if (
    url.origin === "https://mostpomocy.pl" &&
    /^\/l(?:\/|$)/.test(url.pathname)
  )
    throw Error("Krótki link nie może prowadzić do innego krótkiego linku.");
  return url.href;
}
export function shortPath(link) {
  return "/l/" + link.slug + "/";
}
export function campaignFromSearch(search) {
  const query = new URLSearchParams(search);
  const label = (key) =>
    (query.get(key) || "").replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 64);
  if (!["qr", "short_link"].includes(query.get("utm_medium"))) return null;
  const context = {
    code: label("utm_content"),
    source: label("utm_source"),
    medium: label("utm_medium"),
    campaign: label("utm_campaign"),
  };
  return context.code && context.source && context.campaign ? context : null;
}
