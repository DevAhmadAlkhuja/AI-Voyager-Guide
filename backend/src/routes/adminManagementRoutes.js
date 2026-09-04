const express = require("express");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { q } = require("../db/helpers");

const router = express.Router();

router.get("/destinations", auth, isAdmin, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT id, name, description, location, popularity_score, created_at FROM destinations ORDER BY created_at DESC",
    );
    res.status(200).json({ destinations: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/destinations", auth, isAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};

    // Legacy fields
    const legacyName = body.name;
    const legacyDescription = body.description;
    const legacyLocation = body.location;

    // CMS fields
    const title = String(body.title ?? legacyName ?? "").trim();
    const slug = String(body.slug ?? "").trim();

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const name = String(legacyName ?? title).trim();
    const description = String(legacyDescription ?? body.summary ?? body.long_description ?? body.description ?? title).trim();
    const location = String(
      legacyLocation ?? ([body.country, body.city].filter(Boolean).join(", ") || "Malaysia"),
    ).trim();

    if (!name || !description || !location) {
      return res.status(400).json({ message: "name, description, location are required" });
    }

    const popularity_score = Number(body.popularity_score || body.popularityScore || 0);
    const is_published = body.is_published === true || body.is_published === 1 || body.is_published === "1" ? 1 : 0;
    const priority = Number(body.priority || 0);

    const tags = body.tags ? JSON.stringify(body.tags) : null;
    const images = body.images ? JSON.stringify(body.images) : null;

    // If slug is present, enforce uniqueness (CMS mode)
    if (slug) {
      const existing = await q("SELECT id FROM destinations WHERE slug = :slug LIMIT 1", { slug });
      if (existing.length) return res.status(409).json({ message: "Slug already exists" });
    }

    const result = await q(
      "INSERT INTO destinations (name, description, location, popularity_score, slug, title, subtitle, country, city, summary, long_description, tags, meta_title, meta_description, featured_image, images, is_published, priority) " +
        "VALUES (:name, :description, :location, :popularity_score, :slug, :title, :subtitle, :country, :city, :summary, :long_description, :tags, :meta_title, :meta_description, :featured_image, :images, :is_published, :priority)",
      {
        name,
        description,
        location,
        popularity_score,
        slug: slug || null,
        title,
        subtitle: body.subtitle ?? null,
        country: body.country ?? null,
        city: body.city ?? null,
        summary: body.summary ?? null,
        long_description: body.long_description ?? (body.description && !legacyDescription ? body.description : null) ?? null,
        tags,
        meta_title: body.meta_title ?? null,
        meta_description: body.meta_description ?? null,
        featured_image: body.featured_image ?? null,
        images,
        is_published,
        priority,
      },
    );

    const rows = await q("SELECT * FROM destinations WHERE id = :id LIMIT 1", { id: result.insertId });
    res.status(201).json({ destination: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put("/destinations/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, location, popularityScore } = req.body || {};

    await q(
      "UPDATE destinations SET name = COALESCE(:name, name), description = COALESCE(:description, description), location = COALESCE(:location, location), popularity_score = COALESCE(:popularity_score, popularity_score) WHERE id = :id",
      {
        id,
        name: name ?? null,
        description: description ?? null,
        location: location ?? null,
        popularity_score: popularityScore === undefined ? null : Number(popularityScore),
      },
    );

    const rows = await q("SELECT * FROM destinations WHERE id = :id LIMIT 1", { id });
    if (!rows.length) return res.status(404).json({ message: "Destination not found" });

    res.status(200).json({ destination: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/destinations/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await q("DELETE FROM destinations WHERE id = :id", { id });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Destination not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/activities", auth, isAdmin, async (req, res, next) => {
  try {
    const { destinationId, name, description, price, duration } = req.body || {};

    if (!destinationId || !name || !description || !duration) {
      return res.status(400).json({ message: "destinationId, name, description, duration are required" });
    }

    const dest = await q("SELECT id FROM destinations WHERE id = :id LIMIT 1", { id: destinationId });
    if (!dest.length) return res.status(404).json({ message: "Destination not found" });

    const result = await q(
      "INSERT INTO activities (destination_id, name, description, price, duration) VALUES (:destination_id, :name, :description, :price, :duration)",
      {
        destination_id: destinationId,
        name,
        description,
        price: Number(price || 0),
        duration,
      },
    );

    const rows = await q("SELECT * FROM activities WHERE id = :id LIMIT 1", { id: result.insertId });
    res.status(201).json({ activity: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/trips", auth, isAdmin, async (req, res, next) => {
  try {
    const { destinationId, startDate, endDate, capacity, basePrice, activityIds } = req.body || {};

    if (!destinationId || !startDate || !endDate || !capacity || basePrice === undefined) {
      return res.status(400).json({ message: "destinationId, startDate, endDate, capacity, basePrice are required" });
    }

    const dest = await q("SELECT id FROM destinations WHERE id = :id LIMIT 1", { id: destinationId });
    if (!dest.length) return res.status(404).json({ message: "Destination not found" });

    const tripRes = await q(
      "INSERT INTO trips (destination_id, start_date, end_date, capacity, base_price) VALUES (:destination_id, :start_date, :end_date, :capacity, :base_price)",
      {
        destination_id: destinationId,
        start_date: startDate,
        end_date: endDate,
        capacity: Number(capacity),
        base_price: Number(basePrice),
      },
    );

    const tripId = tripRes.insertId;

    const ids = Array.isArray(activityIds) ? activityIds : [];
    for (const activityId of ids) {
      await q(
        "INSERT INTO trip_activities (trip_id, activity_id) VALUES (:trip_id, :activity_id)",
        { trip_id: tripId, activity_id: activityId },
      );
    }

    const tripRows = await q("SELECT * FROM trips WHERE id = :id LIMIT 1", { id: tripId });
    res.status(201).json({ trip: tripRows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/trips", auth, isAdmin, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT tr.id, tr.destination_id, tr.start_date, tr.end_date, tr.capacity, tr.base_price, d.name as destination_name, d.location as destination_location " +
        "FROM trips tr JOIN destinations d ON d.id = tr.destination_id ORDER BY tr.start_date ASC",
    );
    res.status(200).json({ trips: rows });
  } catch (err) {
    next(err);
  }
});

router.put("/trips/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { destinationId, startDate, endDate, capacity, basePrice } = req.body || {};

    await q(
      "UPDATE trips SET destination_id = COALESCE(:destination_id, destination_id), start_date = COALESCE(:start_date, start_date), end_date = COALESCE(:end_date, end_date), capacity = COALESCE(:capacity, capacity), base_price = COALESCE(:base_price, base_price) WHERE id = :id",
      {
        id,
        destination_id: destinationId ?? null,
        start_date: startDate ?? null,
        end_date: endDate ?? null,
        capacity: capacity === undefined ? null : Number(capacity),
        base_price: basePrice === undefined ? null : Number(basePrice),
      },
    );

    const rows = await q("SELECT * FROM trips WHERE id = :id LIMIT 1", { id });
    if (!rows.length) return res.status(404).json({ message: "Trip not found" });
    res.status(200).json({ trip: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/trips/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await q("DELETE FROM trips WHERE id = :id", { id });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Trip not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/trips/:id/bookings", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const rows = await q(
      "SELECT b.id, b.user_id, b.trip_id, b.travelers_count, b.total_price, b.status, b.notes, b.special_requests, b.created_at, " +
        "u.name as user_name, u.email as user_email " +
        "FROM bookings b JOIN users u ON u.id = b.user_id " +
        "WHERE b.trip_id = :tripId ORDER BY b.created_at DESC",
      { tripId: id },
    );

    res.status(200).json({ bookings: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
