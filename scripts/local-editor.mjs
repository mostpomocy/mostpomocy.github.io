import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { clean, resources, visible } from "../src/lib/schema.mjs";
export function localEditor() {
  return {
    name: "mostpomocy-local-editor",
    apply: "serve",
    configureServer(server) {
      const root = process.cwd();
      server.watcher.add(path.join(root, "content"));
      let pending;
      server.watcher.on("all", (event, file) => {
        if (!file.startsWith(path.join(root, "content"))) return;
        clearTimeout(pending);
        pending = setTimeout(() => {
          for (const environment of Object.values(server.environments || {}))
            environment.moduleGraph?.invalidateAll();
          server.ws.send({ type: "full-reload" });
        }, 250);
      });
      const read = async (r) =>
        Promise.all(
          (await fs.readdir(path.join(root, "content", r)))
            .filter((n) => n.endsWith(".json"))
            .map(async (n) =>
              JSON.parse(
                await fs.readFile(path.join(root, "content", r, n), "utf8"),
              ),
            ),
        );
      const handler = async (req, res, next) => {
        const url = new URL(req.url, "http://127.0.0.1");
        if (
          !url.pathname.startsWith("/api/admin/") &&
          url.pathname !== "/api/upload"
        )
          return next();
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        const send = (code, data) => {
          res.statusCode = code;
          res.end(JSON.stringify(data));
        };
        if (
          !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || "") ||
          !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
            req.socket.remoteAddress,
          )
        )
          return send(403, {
            message: "Panel lokalny działa tylko na tym komputerze",
          });
        if (
          req.headers.origin &&
          new URL(req.headers.origin).host !== req.headers.host
        )
          return send(403, { message: "Obce źródło żądania" });
        try {
          if (url.pathname === "/api/upload") {
            if (req.method !== "POST")
              return send(405, { message: "Wymagany POST" });
            if (Number(req.headers["content-length"] || 0) > 6 * 1024 * 1024)
              throw new Error("Limit 5 MB");
            const request = new Request("http://127.0.0.1/api/upload", {
              method: "POST",
              headers: req.headers,
              body: Readable.toWeb(req),
              duplex: "half",
            });
            const form = await request.formData();
            const file = form.get("file");
            if (!(file instanceof File) || file.size > 5 * 1024 * 1024)
              throw new Error("Wybierz zdjęcie do 5 MB");
            const bytes = new Uint8Array(await file.arrayBuffer());
            const ext =
              bytes[0] === 137 && bytes[1] === 80
                ? "png"
                : bytes[0] === 255 && bytes[1] === 216
                  ? "jpg"
                  : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
                      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
                    ? "webp"
                    : "";
            if (!ext) throw new Error("Dozwolone: PNG, JPG, WebP");
            const id = crypto.randomUUID();
            await fs.writeFile(
              path.join(root, "public/uploads", id + "." + ext),
              bytes,
            );
            const data = {
              id,
              name: file.name,
              url: "/uploads/" + id + "." + ext,
              alt: "",
            };
            await fs.writeFile(
              path.join(root, "content/media", id + ".json"),
              JSON.stringify(data, null, 2),
            );
            return send(200, { data });
          }
          const [, resource, id] = url.pathname
            .replace("/api/admin/", "/")
            .split("/");
          if (id && !/^[a-zA-Z0-9-]+$/.test(id))
            throw new Error("Nieprawidłowy identyfikator");
          if (resource === "identity")
            return send(200, { id: "local", fullName: "Igor · panel lokalny" });
          if (resource === "analytics") {
            const posts = await read("posts");
            return send(200, {
              editorial: {
                published: posts.filter((p) => visible(p)).length,
                drafts: posts.filter((p) => p.status === "draft").length,
                scheduled: posts.filter(
                  (p) => p.status === "scheduled" && !visible(p),
                ).length,
                trash: posts.filter((p) => p.status === "trashed").length,
                categories: (await read("categories")).length,
                total: posts.length,
              },
              connected: false,
              tracking: false,
              days: 28,
            });
          }
          if (resource === "revisions") {
            const dir = path.join(root, ".local-history", id);
            let names = [];
            try {
              names = await fs.readdir(dir);
            } catch {}
            return send(200, {
              data: await Promise.all(
                names
                  .sort()
                  .reverse()
                  .slice(0, 30)
                  .map(async (name) => ({
                    id: name,
                    created_at: name.slice(0, -5).replace(/_/g, ":"),
                    data: JSON.parse(
                      await fs.readFile(path.join(dir, name), "utf8"),
                    ),
                  })),
              ),
            });
          }
          if (!resources.includes(resource))
            return send(404, { message: "Nieznana kolekcja" });
          let data = await read(resource);
          if (req.method === "GET") {
            if (id)
              return send(data.some((r) => r.id === id) ? 200 : 404, {
                data: data.find((r) => r.id === id),
              });
            const filter = JSON.parse(url.searchParams.get("filter") || "{}");
            for (const [key, val] of Object.entries(filter)) {
              if (val === "" || val === null || val === undefined) continue;
              if (key === "ids") data = data.filter((r) => val.includes(r.id));
              else if (key === "q")
                data = data.filter((r) =>
                  JSON.stringify(r)
                    .toLocaleLowerCase("pl")
                    .includes(String(val).toLocaleLowerCase("pl")),
                );
              else if (key === "root") data = data.filter((r) => !r.parent_id);
              else
                data = data.filter(
                  (r) =>
                    (r[key] ?? (key === "scope" ? "general" : undefined)) ===
                    val,
                );
            }
            const [field, order] = JSON.parse(
              url.searchParams.get("sort") || '["updated_at","DESC"]',
            );
            data.sort(
              (a, b) =>
                String(a[field] || "").localeCompare(
                  String(b[field] || ""),
                  "pl",
                ) * (order === "DESC" ? -1 : 1),
            );
            const total = data.length;
            const [start, end] = JSON.parse(
              url.searchParams.get("range") || "[0,9999]",
            );
            return send(200, { data: data.slice(start, end + 1), total });
          }
          let raw = "";
          for await (const chunk of req) {
            raw += chunk;
            if (raw.length > 500000) throw new Error("Zbyt duża treść");
          }
          const previous = data.find((r) => r.id === id);
          if (req.method === "DELETE") {
            if (!previous) throw new Error("Nie znaleziono");
            if (["posts", "pages"].includes(resource)) {
              previous.status = "trashed";
              await fs.writeFile(
                path.join(root, "content", resource, id + ".json"),
                JSON.stringify(previous, null, 2) + "\n",
              );
            } else {
              if (
                ["categories", "tags"].includes(resource) &&
                (await read("posts")).some((p) =>
                  resource === "categories"
                    ? p.category_id === id
                    : p.tags?.includes(id),
                )
              )
                throw new Error("Element jest używany przez artykuły");
              if (resource === "settings")
                throw new Error("Ustawień nie można usunąć");
              if (resource === "places" && data.some((p) => p.parent_id === id))
                throw new Error("Instytucja ma przypisane działy");
              await fs.unlink(
                path.join(root, "content", resource, id + ".json"),
              );
            }
            return send(200, { data: previous });
          }
          const entry = clean(resource, {
            ...JSON.parse(raw),
            ...(id ? { id } : {}),
          });
          if (
            data.some(
              (r) => r.id !== entry.id && r.slug && r.slug === entry.slug,
            )
          )
            throw new Error("Ten URL już istnieje");
          if (resource === "posts") {
            if (
              entry.category_id &&
              !(await read("categories")).some(
                (c) => c.id === entry.category_id,
              )
            )
              throw new Error("Nieznana kategoria");
            for (const tag of entry.tags)
              if (!(await read("tags")).some((t) => t.id === tag))
                throw new Error("Nieznany tag");
            if (entry.image && !entry.image_alt)
              throw new Error("Dodaj opis zdjęcia");
          }
          if (
            resource === "places" &&
            entry.parent_id &&
            !data.some(
              (p) =>
                p.id === entry.parent_id &&
                !p.parent_id &&
                p.section === "mops" &&
                p.id !== entry.id,
            )
          )
            throw new Error("Nieprawidłowa instytucja nadrzędna");
          entry.updated_at = new Date().toISOString();
          if (previous && ["posts", "pages"].includes(resource)) {
            const dir = path.join(root, ".local-history", id);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(
              path.join(
                dir,
                new Date().toISOString().replace(/:/g, "_") + ".json",
              ),
              JSON.stringify(previous, null, 2),
            );
          }
          await fs.writeFile(
            path.join(root, "content", resource, entry.id + ".json"),
            JSON.stringify(entry, null, 2) + "\n",
          );
          send(200, { data: entry });
        } catch (error) {
          send(400, { message: error.message });
        }
      };
      return () => {
        server.middlewares.stack.unshift({ route: "", handle: handler });
      };
    },
  };
}
