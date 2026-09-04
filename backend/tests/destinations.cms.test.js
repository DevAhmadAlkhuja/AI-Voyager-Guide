const test = require("node:test");
const assert = require("node:assert");

const API = process.env.TEST_API_BASE || "http://localhost:5000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin12345";

async function loginAdmin() {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json().catch(() => ({}));
  assert.equal(res.ok, true, `login failed: ${json?.message || res.status}`);
  assert.ok(json.token, "token missing");
  assert.ok(json.user, "user missing");
  assert.equal(json.user.role, "admin");
  return json.token;
}

async function authed(token, path, init = {}) {
  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetch(`${API}${path}`, { ...init, headers });
}

test("admin destinations CMS: create -> update -> publish -> get public -> delete", async () => {
  const token = await loginAdmin();

  const uniq = Date.now();
  const slug = `test-dest-${uniq}`;

  // create
  const createRes = await authed(token, "/api/admin/destinations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `Test Destination ${uniq}`,
      slug,
      country: "Testland",
      city: "Test City",
      summary: "Short summary",
      tags: ["City", "Nature"],
      images: ["/uploads/destinations/example.png"],
      is_published: 0,
      priority: 5,
    }),
  });
  const createdJson = await createRes.json().catch(() => ({}));
  assert.equal(createRes.status, 201, `create failed: ${createdJson?.message || createRes.status}`);
  const id = createdJson?.destination?.id;
  assert.ok(id, "created id missing");

  // list with search
  const listRes = await authed(token, `/api/admin/destinations?q=${encodeURIComponent(slug)}&limit=10&page=1`);
  const listJson = await listRes.json().catch(() => ({}));
  assert.equal(listRes.ok, true);
  assert.ok(Array.isArray(listJson.destinations));
  assert.ok(listJson.destinations.find((d) => d.id === id));

  // update slug uniqueness check (collision)
  const collisionRes = await authed(token, "/api/admin/destinations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: `Collision ${uniq}`, slug, is_published: 0, priority: 0 }),
  });
  assert.equal(collisionRes.status, 409);

  // update
  const updRes = await authed(token, `/api/admin/destinations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priority: 99 }),
  });
  const updJson = await updRes.json().catch(() => ({}));
  assert.equal(updRes.ok, true);
  assert.equal(Number(updJson.destination.priority), 99);

  // publish
  const pubRes = await authed(token, `/api/admin/destinations/${id}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_published: 1 }),
  });
  const pubJson = await pubRes.json().catch(() => ({}));
  assert.equal(pubRes.ok, true);
  assert.equal(Number(pubJson.destination.is_published), 1);

  // public get by slug
  const pubGetRes = await fetch(`${API}/api/destinations/${encodeURIComponent(slug)}`);
  const pubGetJson = await pubGetRes.json().catch(() => ({}));
  assert.equal(pubGetRes.ok, true);
  assert.equal(pubGetJson.destination.slug, slug);

  // delete
  const delRes = await authed(token, `/api/admin/destinations/${id}`, { method: "DELETE" });
  assert.equal(delRes.status, 204);

  // public should 404
  const pub404Res = await fetch(`${API}/api/destinations/${encodeURIComponent(slug)}`);
  assert.equal(pub404Res.status, 404);
});
