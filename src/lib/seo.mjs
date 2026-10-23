// Automatic canonicals omit tracking parameters; explicit editorial overrides are preserved.
export function canonicalURL(pathname, site, override) {
  const address = new URL(override || pathname, site);
  address.hash = "";
  if (!override) address.search = "";
  if (!address.pathname.split("/").pop()?.includes("."))
    address.pathname = address.pathname.replace(/\/+$/, "") + "/";
  return address.href;
}
export function searchDescription(value, fallback = "") {
  const plain = String(value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= 180) return plain;
  const cut = plain.slice(0, 177);
  return (
    cut.slice(0, cut.lastIndexOf(" ") > 130 ? cut.lastIndexOf(" ") : 177) + "…"
  );
}
