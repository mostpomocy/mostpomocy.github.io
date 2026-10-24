import fs from "node:fs";
import { clean, resources, reserved } from "../src/lib/schema.mjs";
export function validate(root = process.cwd()) {
  const all = {};
  for (const resource of resources) {
    all[resource] = fs
      .readdirSync(`${root}/content/${resource}`)
      .filter((n) => n.endsWith(".json"))
      .map((name) => {
        let entry;
        try {
          entry = clean(
            resource,
            JSON.parse(
              fs.readFileSync(`${root}/content/${resource}/${name}`, "utf8"),
            ),
          );
        } catch (error) {
          const details = error.issues
            ? error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ")
            : error.message;
          throw new Error(
            `Błąd treści w content/${resource}/${name}: ${details}`,
            { cause: error },
          );
        }
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
  for (const file of all.downloads)
    if (!fs.existsSync(root + "/public" + file.file))
      throw new Error("Brak załącznika: " + file.title);
  for (const album of all.galleries)
    for (const image of album.images)
      if (!fs.existsSync(root + "/public" + image.src))
        throw new Error("Brak zdjęcia w galerii: " + album.title);
  for (const post of all.posts) {
    for (const id of post.related_page_ids)
      if (!all.pages.some((page) => page.id === id))
        throw new Error("Nieznana powiązana podstrona: " + post.title);
    if (post.author_id && !all.authors.some((a) => a.id === post.author_id))
      throw new Error("Nieznany autor: " + post.title);
    for (const id of post.related_place_ids)
      if (!all.places.some((p) => p.id === id))
        throw new Error("Nieznana jednostka: " + post.title);
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
      !all.places.some((p) => p.id === place.parent_id && p.id !== place.id)
    )
      throw new Error("Nieprawidłowa jednostka nadrzędna: " + place.name);
    const visited = new Set([place.id]);
    let parent = place.parent_id;
    while (parent) {
      if (visited.has(parent)) throw new Error("Cykl jednostek: " + place.name);
      visited.add(parent);
      parent = all.places.find((p) => p.id === parent)?.parent_id;
    }
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
