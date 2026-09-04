const express = require("express");
const { auth } = require("../middleware/auth");
const { q } = require("../db/helpers");

const router = express.Router();

function assertString(v, msg) {
  if (typeof v !== "string" || !v.trim()) {
    const err = new Error(msg);
    err.statusCode = 400;
    throw err;
  }
}

function assertDate(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const err = new Error("Invalid date");
    err.statusCode = 400;
    throw err;
  }
}

function assertLatLng(lat, lng) {
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) {
    const err = new Error("Invalid latitude/longitude");
    err.statusCode = 400;
    throw err;
  }
}

router.get("/events", auth, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT id, user_id, date, time, country, country_code, city, latitude, longitude, title, description, created_at " +
        "FROM events WHERE user_id = :uid ORDER BY date ASC, time ASC, id ASC",
      { uid: req.user.id },
    );

    res.status(200).json({ events: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      date: typeof r.date === "string" ? r.date : new Date(r.date).toISOString().slice(0, 10),
      time: r.time || null,
      country: r.country,
      countryCode: r.country_code,
      city: r.city,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      title: r.title,
      description: r.description || "",
      createdAt: r.created_at,
    })) });
  } catch (err) {
    next(err);
  }
});

router.post("/events", auth, async (req, res, next) => {
  try {
    const body = req.body || {};

    assertDate(body.date);
    assertString(body.country, "Country is required");
    assertString(body.countryCode, "Country code is required");
    assertString(body.city, "City is required");
    assertString(body.title, "Event title is required");
    assertLatLng(body.latitude, body.longitude);

    const time = body.time != null ? String(body.time) : null;
    if (time && !/^\d{2}:\d{2}$/.test(time)) {
      const err = new Error("Invalid time");
      err.statusCode = 400;
      throw err;
    }

    const desc = body.description != null ? String(body.description) : null;

    const out = await q(
      "INSERT INTO events (user_id, date, time, country, country_code, city, latitude, longitude, title, description) " +
        "VALUES (:uid, :date, :time, :country, :country_code, :city, :lat, :lng, :title, :description)",
      {
        uid: req.user.id,
        date: body.date,
        time,
        country: String(body.country).trim(),
        country_code: String(body.countryCode).trim().toUpperCase(),
        city: String(body.city).trim(),
        lat: Number(body.latitude),
        lng: Number(body.longitude),
        title: String(body.title).trim(),
        description: desc,
      },
    );

    const rows = await q(
      "SELECT id, user_id, date, time, country, country_code, city, latitude, longitude, title, description, created_at " +
        "FROM events WHERE id = :id AND user_id = :uid LIMIT 1",
      { id: out.insertId, uid: req.user.id },
    );

    const r = rows[0];
    res.status(201).json({
      event: {
        id: r.id,
        userId: r.user_id,
        date: typeof r.date === "string" ? r.date : new Date(r.date).toISOString().slice(0, 10),
        time: r.time || null,
        country: r.country,
        countryCode: r.country_code,
        city: r.city,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        title: r.title,
        description: r.description || "",
        createdAt: r.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/events/:id", auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      const err = new Error("Invalid id");
      err.statusCode = 400;
      throw err;
    }

    const rows = await q("SELECT id FROM events WHERE id = :id AND user_id = :uid LIMIT 1", { id, uid: req.user.id });
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    await q("DELETE FROM events WHERE id = :id AND user_id = :uid", { id, uid: req.user.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
