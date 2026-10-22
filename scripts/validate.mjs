import fs from "node:fs";
import { clean, resources, reserved } from "../src/lib/schema.mjs";
export function validate(root = process.cwd()) {
  const all = {};
  for (const resource of resources) {
    all[resource] = fs
      .readdirSync(`${root}/content/${resource}`)
      .filter((n) => n.endsWith(".json"))
      .map((name) => {
        const entry = clean(
          resource,
          JSON.parse(
            fs.readFileSync(`${root}/content/${resource}/${name}`, "utf8"),
          ),
        );
        if (name !== entry.id + ".json")
          throw new Error(
            `Nazwa pliku musi odpowiadać ID: ${resource}/${name}`,
          );
        return entry;
      });
    const seen = new Set();
    for (const entry of all[resource]) {
      if (
        entry.slug &&
        seen.has((entry.section || "general") + ":" + entry.slug)
      )
        throw new Error("Powtórzony URL: " + entry.slug);
      seen.add((entry.section || "general") + ":" + entry.slug);
    }
  }
  for (const post of all.posts) {
    if (
      post.category_id &&
      !all.categories.some((c) => c.id === post.category_id)
    )
      throw new Error("Nieznana kategoria: " + post.title);
    for (const tag of post.tags)
      if (!all.tags.some((t) => t.id === tag))
        throw new Error("Nieznany tag: " + tag);
    if (post.image && !post.image_alt)
      throw new Error("Dodaj opis alternatywny zdjęcia: " + post.title);
  }
  for (const item of [...all.posts, ...all.pages]) {
    if (
      item.local_category_id &&
      !all.local_categories.some((c) => c.id === item.local_category_id)
    )
      throw new Error("Nieznana kategoria lokalna: " + item.title);
  }
  for (const place of all.places) {
    if (
      place.parent_id &&
      !all.places.some(
        (p) =>
          p.id === place.parent_id &&
          p.section === "mops" &&
          !p.parent_id &&
          p.id !== place.id,
      )
    )
      throw new Error("Nieprawidłowy nadrzędny MOPS: " + place.name);
  }
  console.log(
    "Treści sprawdzone:",
    Object.entries(all)
      .map(([k, v]) => `${k}: ${v.length}`)
      .join(", "),
  );
  return all;
}
if (import.meta.url === new URL(process.argv[1], "file:").href) validate();
