const express = require("express");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { q } = require("../db/helpers");

const router = express.Router();

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function toBoolInt(v) {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  return 0;
}

function parseJsonOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "object") return JSON.stringify(v);
  const s = String(v);
  try {
    JSON.parse(s);
    return s;
  } catch {
    return null;
  }
}

router.post("/admin/destinations", auth, isAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};

    const title = String(body.title ?? body.name ?? "").trim();
    if (!title) return res.status(400).json({ message: "title is required" });

    const requestedSlug = String(body.slug ?? "").trim();
    const slug = slugify(requestedSlug || title);
    if (!slug) return res.status(400).json({ message: "slug is required" });

    const existing = await q("SELECT id FROM destinations WHERE slug = :slug LIMIT 1", { slug });
    if (existing.length) return res.status(409).json({ message: "Slug already exists" });

    const tagsJson = parseJsonOrNull(body.tags);
    const imagesJson = parseJsonOrNull(body.images);

    const legacyName = title;
    const legacyDesc = String(body.summary ?? body.description ?? body.long_description ?? "").trim() || title;
    const legacyLoc = [body.country, body.city].filter(Boolean).join(", ") || String(body.location ?? "").trim() || "Malaysia";

    const result = await q(
      "INSERT INTO destinations (" +
        "name, description, location, popularity_score, " +
        "slug, title, subtitle, country, city, summary, long_description, tags, meta_title, meta_description, featured_image, images, is_published, priority" +
        ") VALUES (" +
        ":name, :description, :location, :popularity_score, " +
        ":slug, :title, :subtitle, :country, :city, :summary, :long_description, :tags, :meta_title, :meta_description, :featured_image, :images, :is_published, :priority" +
        ")",
      {
        name: legacyName,
        description: legacyDesc,
        location: legacyLoc,
        popularity_score: Number(body.popularity_score || body.popularityScore || 0),
        slug,
        title,
        subtitle: body.subtitle ?? null,
        country: body.country ?? null,
        city: body.city ?? null,
        summary: body.summary ?? null,
        long_description: body.description ?? body.long_description ?? null,
        tags: tagsJson,
        meta_title: body.meta_title ?? null,
        meta_description: body.meta_description ?? null,
        featured_image: body.featured_image ?? null,
        images: imagesJson,
        is_published: toBoolInt(body.is_published),
        priority: Number(body.priority || 0),
      },
    );

    const rows = await q("SELECT * FROM destinations WHERE id = :id LIMIT 1", { id: result.insertId });
    res.status(201).json({ destination: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/destinations", auth, isAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const qRaw = String(req.query.q || "").trim();
    const published = req.query.published;
    const sort = String(req.query.sort || "priority_desc");

    const where = [];
    const params = { limit, offset, q: `%${qRaw}%` };

    if (qRaw) {
      where.push(
        "(title LIKE :q OR slug LIKE :q OR country LIKE :q OR city LIKE :q OR JSON_SEARCH(tags, 'one', :q, NULL, '$') IS NOT NULL)",
      );
    }

    if (published === "1" || published === "0") {
      where.push("is_published = :is_published");
      params.is_published = Number(published);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const orderBy =
      sort === "created_at_desc"
        ? "created_at DESC"
        : sort === "created_at_asc"
          ? "created_at ASC"
          : sort === "priority_asc"
            ? "priority ASC, created_at DESC"
            : "priority DESC, created_at DESC";

    const countRows = await q(`SELECT COUNT(*) as cnt FROM destinations ${whereSql}`, params);
    const total = Number(countRows[0]?.cnt || 0);

    const rows = await q(
      `SELECT id, slug, title, subtitle, country, city, summary, featured_image, is_published, priority, views_count, created_at, updated_at
       FROM destinations ${whereSql}
       ORDER BY ${orderBy}
       LIMIT :limit OFFSET :offset`,
      params,
    );

    res.status(200).json({
      destinations: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/destinations/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const rows = await q("SELECT * FROM destinations WHERE id = :id LIMIT 1", { id });
    if (!rows.length) return res.status(404).json({ message: "Destination not found" });

    res.status(200).json({ destination: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put("/admin/destinations/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const existing = await q("SELECT id, slug FROM destinations WHERE id = :id LIMIT 1", { id });
    if (!existing.length) return res.status(404).json({ message: "Destination not found" });

    const body = req.body || {};

    let newSlug;
    if (body.slug !== undefined || body.title !== undefined) {
      const requestedSlug = body.slug !== undefined ? String(body.slug).trim() : "";
      const fallbackTitle = body.title !== undefined ? String(body.title).trim() : "";
      newSlug = slugify(requestedSlug || fallbackTitle);
      if (!newSlug) return res.status(400).json({ message: "slug cannot be empty" });

      if (newSlug !== existing[0].slug) {
        const collision = await q("SELECT id FROM destinations WHERE slug = :slug AND id <> :id LIMIT 1", { slug: newSlug, id });
        if (collision.length) return res.status(409).json({ message: "Slug already exists" });
      }
    }

    const tagsJson = body.tags !== undefined ? parseJsonOrNull(body.tags) : undefined;
    const imagesJson = body.images !== undefined ? parseJsonOrNull(body.images) : undefined;

    const patch = {
      slug: newSlug,
      title: body.title !== undefined ? String(body.title).trim() : undefined,
      subtitle: body.subtitle !== undefined ? (body.subtitle ?? null) : undefined,
      country: body.country !== undefined ? (body.country ?? null) : undefined,
      city: body.city !== undefined ? (body.city ?? null) : undefined,
      summary: body.summary !== undefined ? (body.summary ?? null) : undefined,
      long_description:
        body.description !== undefined || body.long_description !== undefined
          ? (body.description ?? body.long_description ?? null)
          : undefined,
      tags: tagsJson,
      meta_title: body.meta_title !== undefined ? (body.meta_title ?? null) : undefined,
      meta_description: body.meta_description !== undefined ? (body.meta_description ?? null) : undefined,
      featured_image: body.featured_image !== undefined ? (body.featured_image ?? null) : undefined,
      images: imagesJson,
      is_published: body.is_published !== undefined ? toBoolInt(body.is_published) : undefined,
      priority: body.priority !== undefined ? Number(body.priority || 0) : undefined,
    };

    // Keep legacy required columns in sync
    if (patch.title !== undefined) {
      patch.name = patch.title;
    }
    if (patch.summary !== undefined || patch.long_description !== undefined) {
      const legacyDesc = String(patch.summary ?? patch.long_description ?? "").trim();
      patch.description = legacyDesc || null;
    }
    if (patch.country !== undefined || patch.city !== undefined) {
      const legacyLoc = [patch.country, patch.city].filter(Boolean).join(", ");
      patch.location = legacyLoc || null;
    }

    const fields = Object.entries(patch).filter(([, v]) => v !== undefined);
    if (!fields.length) return res.status(400).json({ message: "No fields to update" });

    const setSql = fields.map(([k]) => `${k} = :${k}`).join(", ");
    const params = Object.fromEntries(fields);
    params.id = id;

    await q(`UPDATE destinations SET ${setSql} WHERE id = :id`, params);

    const rows = await q("SELECT * FROM destinations WHERE id = :id LIMIT 1", { id });
    res.status(200).json({ destination: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/destinations/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const result = await q("DELETE FROM destinations WHERE id = :id", { id });
    if (!result.affectedRows) return res.status(404).json({ message: "Destination not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/admin/destinations/bulk-delete", auth, isAdmin, async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids must be a non-empty array" });
    }

    const norm = ids.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0);
    if (!norm.length) return res.status(400).json({ message: "ids must be positive integers" });

    const placeholders = norm.map((_, i) => `:id${i}`).join(",");
    const params = {};
    norm.forEach((v, i) => {
      params[`id${i}`] = v;
    });

    await q(`DELETE FROM destinations WHERE id IN (${placeholders})`, params);
    res.status(200).json({ deletedIds: norm });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/destinations/:id/publish", auth, isAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const existing = await q("SELECT id, is_published FROM destinations WHERE id = :id LIMIT 1", { id });
    if (!existing.length) return res.status(404).json({ message: "Destination not found" });

    const nextVal = req.body?.is_published !== undefined ? toBoolInt(req.body.is_published) : existing[0].is_published ? 0 : 1;
    await q("UPDATE destinations SET is_published = :v WHERE id = :id", { v: nextVal, id });

    const rows = await q("SELECT id, is_published FROM destinations WHERE id = :id LIMIT 1", { id });
    res.status(200).json({ destination: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
