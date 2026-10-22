import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.MP_TEST_URL || "http://127.0.0.1:5173";
const api = async (path, method = "GET", data) => {
  const r = await fetch(base + "/api/admin/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  return { code: r.status, ...(await r.json()) };
};
const files = [
  ["tags", "test-tag-smoke"],
  ["posts", "test-post-smoke"],
];
try {
  assert.equal((await api("identity")).code, 200);
  const blocked = await fetch(base + "/api/admin/identity", {
    headers: { Origin: "https://example.org" },
  });
  assert.equal(blocked.status, 403);
  const tag = await api("tags", "POST", {
    id: "test-tag-smoke",
    name: "Próbny tag",
    slug: "test-tag-smoke",
  });
  assert.equal(tag.code, 200);
  const post = await api("posts", "POST", {
    id: "test-post-smoke",
    title: "Próba tagowania",
    slug: "test-post-smoke",
    body: "<p>Próba edycji.</p>",
    category_id: "poradniki",
    tags: [tag.data.id],
    status: "draft",
  });
  assert.equal(post.code, 200);
  assert.equal((await api("tags/test-tag-smoke", "DELETE")).code, 400);
  const changed = await api("posts/test-post-smoke", "PUT", {
    ...post.data,
    title: "Tagowanie zmienione",
  });
  assert.equal(changed.code, 200);
  assert.deepEqual(changed.data.tags, ["test-tag-smoke"]);
  assert.equal(
    (await api("posts/test-post-smoke", "DELETE")).data.status,
    "trashed",
  );
  const page = await api("pages/test-podstrony");
  if (page.code === 200) {
    const changed = await api("pages/test-podstrony", "PUT", {
      ...page.data,
      excerpt: "Edycja działa i podgląd jest aktualny.",
    });
    assert.equal(changed.code, 200);
    let found = false;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const html = await (await fetch(base + "/test-podstrony/")).text();
      if (html.includes("Edycja działa i podgląd jest aktualny.")) {
        found = true;
        break;
      }
    }
    assert.ok(found, "Podgląd musi pokazać zapisane zmiany");
  }
  console.log(
    "Panel: zapis, tagi, relacje, kosz, kontrola Origin i odświeżenie podstrony — OK",
  );
} finally {
  for (const [r, id] of files) {
    await fs.rm(`content/${r}/${id}.json`, { force: true });
    await fs.rm(`.local-history/${id}`, { recursive: true, force: true });
  }
}
