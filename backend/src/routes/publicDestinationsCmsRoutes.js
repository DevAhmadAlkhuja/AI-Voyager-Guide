const express = require("express");
const { q } = require("../db/helpers");

const router = express.Router();

router.get("/destinations", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const qRaw = String(req.query.q || "").trim();
    const country = String(req.query.country || "").trim();
    const city = String(req.query.city || "").trim();
    const sort = String(req.query.sort || "priority_desc");

    const where = ["is_published = 1"]; 
    const params = { limit, offset, q: `%${qRaw}%` };

    if (qRaw) {
      where.push("(title LIKE :q OR slug LIKE :q OR country LIKE :q OR city LIKE :q OR JSON_SEARCH(tags, 'one', :q, NULL, '$') IS NOT NULL)");
    }
    if (country) {
      where.push("country = :country");
      params.country = country;
    }
    if (city) {
      where.push("city = :city");
      params.city = city;
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

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
      `SELECT id, slug, title, subtitle, country, city, summary, featured_image, images, tags, priority, views_count, created_at, updated_at
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

router.get("/destinations/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ message: "Invalid slug" });

    const rows = await q(
      "SELECT id, slug, title, subtitle, country, city, summary, long_description, tags, meta_title, meta_description, featured_image, images, priority, views_count, created_at, updated_at " +
        "FROM destinations WHERE slug = :slug AND is_published = 1 LIMIT 1",
      { slug },
    );

    if (!rows.length) return res.status(404).json({ message: "Destination not found" });

    await q("UPDATE destinations SET views_count = views_count + 1 WHERE id = :id", { id: rows[0].id });

    const updated = { ...rows[0], views_count: Number(rows[0].views_count || 0) + 1 };
    res.status(200).json({ destination: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
