const express = require("express");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { q } = require("../db/helpers");

const router = express.Router();

const MAX_LIMIT = 50;

// Simple in-memory rate limiter (IP-based). Avoids new dependencies.
const rateWindowMs = 60_000;
const rateMax = 60;
const rateState = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateState.get(ip) || { windowStart: now, count: 0 };
  if (now - entry.windowStart > rateWindowMs) {
    entry.windowStart = now;
    entry.count = 0;
  }
  entry.count += 1;
  rateState.set(ip, entry);
  if (entry.count > rateMax) {
    return res.status(429).json({ message: "Too many requests" });
  }
  return next();
}

function parseCsvTypes(v) {
  if (!v) return null;
  const allowed = new Set(["trips", "destinations", "stages", "bookings"]);
  const types = String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((t) => allowed.has(t));
  return types.length ? types : null;
}

function sanitizeQuery(qRaw) {
  const s = String(qRaw || "").trim();
  // basic guardrails
  if (s.length > 120) return s.slice(0, 120);
  return s;
}

function makeSnippet(text, qText) {
  const raw = String(text || "");
  const q = String(qText || "").trim();
  if (!raw) return "";
  if (!q) return raw.slice(0, 140);

  const idx = raw.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return raw.slice(0, 140);
  const start = Math.max(0, idx - 50);
  const end = Math.min(raw.length, idx + q.length + 90);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < raw.length ? "…" : "";
  return `${prefix}${raw.slice(start, end)}${suffix}`;
}

function sortResults(results, sort) {
  if (sort === "newest") {
    return results.sort((a, b) => {
      const ad = a.meta?.created_at ? new Date(a.meta.created_at).getTime() : 0;
      const bd = b.meta?.created_at ? new Date(b.meta.created_at).getTime() : 0;
      return bd - ad;
    });
  }
  if (sort === "popular") {
    return results.sort((a, b) => (Number(b.meta?.popularity || 0) - Number(a.meta?.popularity || 0)) || (b.score - a.score));
  }
  return results.sort((a, b) => b.score - a.score);
}

async function safeQuery(fn, fallbackFn) {
  try {
    return await fn();
  } catch (e) {
    return fallbackFn ? await fallbackFn(e) : [];
  }
}

// Optional auth: if token is present, attach req.user; otherwise proceed anonymous
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();
  try {
    await auth(req, res, next);
  } catch {
    return next();
  }
}

router.get("/search", rateLimit, optionalAuth, async (req, res, next) => {
  const started = Date.now();
  try {
    const qText = sanitizeQuery(req.query.q);
    if (!qText) return res.status(400).json({ message: "q is required" });

    const types = parseCsvTypes(req.query.types);
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit || 20)));
    const sort = String(req.query.sort || "relevance");
    const fuzzy = String(req.query.fuzzy || "").toLowerCase() === "true";

    const offset = (page - 1) * limit;

    const safe = qText.replace(/[%_]/g, "\\$&");
    const like = `%${safe}%`;
    const prefix = `${safe}%`;

    const canAdminSearch = Boolean(req.user && req.user.role === "admin");

    const facets = { trips: 0, destinations: 0, stages: 0, bookings: 0 };
    const results = [];

    // Static page results (so users can search for app pages)
    const qLower = qText.toLowerCase();
    const pageHits = [];
    if (qLower.includes("destination") || qLower.includes("destinations")) {
      pageHits.push({
        type: "page",
        id: "destinations",
        title: "Destinations",
        snippet: "Browse all destinations",
        score: 100,
        meta: { href: "/destinations" },
      });
    }
    if (qLower.includes("activit") || qLower.includes("activities")) {
      pageHits.push({
        type: "page",
        id: "activities",
        title: "Activities",
        snippet: "Explore activities and adventures",
        score: 100,
        meta: { href: "/activities" },
      });
    }
    results.push(...pageHits);

    // Destinations (public-only)
    if (!types || types.includes("destinations")) {
      const destRows = await safeQuery(
        () =>
          q(
            "SELECT id, slug, title, subtitle, summary, long_description, tags, featured_image, views_count, priority, created_at, updated_at " +
              "FROM destinations " +
              "WHERE is_published = 1 AND (" +
              "MATCH(title, subtitle, summary, long_description) AGAINST(:q IN BOOLEAN MODE) " +
              (fuzzy ? "OR title LIKE :like OR slug LIKE :like OR summary LIKE :like " : "") +
              "OR title LIKE :prefix OR slug LIKE :prefix" +
              ") " +
              "LIMIT 200",
            { q: `${safe}*`, like, prefix },
          ),
        () =>
          q(
            "SELECT id, slug, title, subtitle, summary, long_description, tags, featured_image, views_count, priority, created_at, updated_at " +
              "FROM destinations " +
              "WHERE is_published = 1 AND (" +
              "title LIKE :like OR slug LIKE :like OR subtitle LIKE :like OR summary LIKE :like OR long_description LIKE :like " +
              "OR title LIKE :prefix OR slug LIKE :prefix" +
              ") " +
              "LIMIT 200",
            { like, prefix },
          ),
      );

      for (const r of destRows) {
        const title = r.title || r.slug || "Destination";
        const baseScore = 0;
        const score =
          (String(r.title || "").toLowerCase() === qText.toLowerCase() ? 80 : 0) +
          (String(r.title || "").toLowerCase().startsWith(qText.toLowerCase()) ? 40 : 0) +
          (String(r.subtitle || "").toLowerCase().includes(qText.toLowerCase()) ? 12 : 0) +
          (String(r.summary || "").toLowerCase().includes(qText.toLowerCase()) ? 8 : 0) +
          (Number(r.priority || 0) * 0.3) +
          (Number(r.views_count || 0) * 0.02) +
          baseScore;

        results.push({
          type: "destination",
          id: String(r.slug || r.id),
          title,
          snippet: makeSnippet(r.summary || r.long_description || "", qText),
          score,
          meta: {
            slug: r.slug,
            featuredImage: r.featured_image || null,
            popularity: Number(r.views_count || 0),
            created_at: r.created_at,
          },
        });
      }
      facets.destinations = destRows.length;
    }

    // Trips (public)
    if (!types || types.includes("trips")) {
      const tripRows = await q(
        "SELECT tr.id, tr.start_date, tr.end_date, tr.capacity, tr.base_price, d.slug as destination_slug, d.title as destination_title, d.summary as destination_summary, d.views_count, d.priority, d.featured_image " +
          "FROM trips tr JOIN destinations d ON d.id = tr.destination_id " +
          "WHERE d.is_published = 1 AND (" +
          "d.title LIKE :like OR d.slug LIKE :like OR d.summary LIKE :like" +
          ") " +
          "ORDER BY tr.start_date ASC LIMIT 200",
        { like },
      );

      for (const r of tripRows) {
        const title = `Trip to ${r.destination_title || "Destination"}`;
        const score =
          (String(r.destination_title || "").toLowerCase() === qText.toLowerCase() ? 70 : 0) +
          (String(r.destination_title || "").toLowerCase().startsWith(qText.toLowerCase()) ? 35 : 0) +
          (String(r.destination_summary || "").toLowerCase().includes(qText.toLowerCase()) ? 8 : 0) +
          (Number(r.priority || 0) * 0.25) +
          (Number(r.views_count || 0) * 0.02);

        results.push({
          type: "trip",
          id: String(r.id),
          title,
          snippet: makeSnippet(r.destination_summary || "", qText),
          score,
          meta: {
            tripId: r.id,
            destinationSlug: r.destination_slug,
            startDate: r.start_date,
            endDate: r.end_date,
            basePrice: Number(r.base_price),
            featuredImage: r.featured_image || null,
            popularity: Number(r.views_count || 0),
            created_at: r.start_date,
          },
        });
      }
      facets.trips = tripRows.length;
    }

    // "Stages" => Activities (public)
    if (!types || types.includes("stages")) {
      const stageRows = await safeQuery(
        () =>
          q(
            "SELECT a.id, a.name, a.description, a.price, a.duration, d.slug as destination_slug, d.title as destination_title, d.is_published " +
              "FROM activities a JOIN destinations d ON d.id = a.destination_id " +
              "WHERE d.is_published = 1 AND (" +
              "MATCH(a.name, a.description) AGAINST(:q IN BOOLEAN MODE) OR a.name LIKE :like OR a.description LIKE :like OR d.title LIKE :like" +
              ") " +
              "ORDER BY a.id DESC LIMIT 200",
            { q: `${safe}*`, like },
          ),
        () =>
          q(
            "SELECT a.id, a.name, a.description, a.price, a.duration, d.slug as destination_slug, d.title as destination_title, d.is_published " +
              "FROM activities a JOIN destinations d ON d.id = a.destination_id " +
              "WHERE d.is_published = 1 AND (a.name LIKE :like OR a.description LIKE :like OR d.title LIKE :like) " +
              "ORDER BY a.id DESC LIMIT 200",
            { like },
          ),
      );

      for (const r of stageRows) {
        const title = r.name;
        const score =
          (String(r.name || "").toLowerCase() === qText.toLowerCase() ? 60 : 0) +
          (String(r.name || "").toLowerCase().startsWith(qText.toLowerCase()) ? 30 : 0) +
          (String(r.description || "").toLowerCase().includes(qText.toLowerCase()) ? 10 : 0) +
          (String(r.destination_title || "").toLowerCase().includes(qText.toLowerCase()) ? 8 : 0);

        results.push({
          type: "stage",
          id: String(r.id),
          title,
          snippet: makeSnippet(r.description || "", qText),
          score,
          meta: {
            destinationSlug: r.destination_slug,
            destinationTitle: r.destination_title,
            price: Number(r.price || 0),
            duration: r.duration,
            popularity: 0,
          },
        });
      }
      facets.stages = stageRows.length;
    }

    // Bookings (admin only)
    if (canAdminSearch && (!types || types.includes("bookings"))) {
      const bookingRows = await safeQuery(
        () =>
          q(
            "SELECT b.id, b.user_id, b.trip_id, b.status, b.special_requests, b.notes, b.created_at, " +
              "u.name as user_name, d.title as destination_title " +
              "FROM bookings b " +
              "JOIN users u ON u.id = b.user_id " +
              "JOIN trips tr ON tr.id = b.trip_id " +
              "JOIN destinations d ON d.id = tr.destination_id " +
              "WHERE (MATCH(b.special_requests, b.notes) AGAINST(:q IN BOOLEAN MODE) OR b.special_requests LIKE :like OR u.name LIKE :like OR d.title LIKE :like) " +
              "ORDER BY b.created_at DESC LIMIT 200",
            { q: `${safe}*`, like },
          ),
        () =>
          q(
            "SELECT b.id, b.user_id, b.trip_id, b.status, b.special_requests, b.notes, b.created_at, " +
              "u.name as user_name, d.title as destination_title " +
              "FROM bookings b " +
              "JOIN users u ON u.id = b.user_id " +
              "JOIN trips tr ON tr.id = b.trip_id " +
              "JOIN destinations d ON d.id = tr.destination_id " +
              "WHERE (b.special_requests LIKE :like OR u.name LIKE :like OR d.title LIKE :like OR b.notes LIKE :like) " +
              "ORDER BY b.created_at DESC LIMIT 200",
            { like },
          ),
      );

      for (const r of bookingRows) {
        const title = `Booking • ${r.destination_title}`;
        const score =
          (String(r.destination_title || "").toLowerCase().includes(qText.toLowerCase()) ? 22 : 0) +
          (String(r.user_name || "").toLowerCase().includes(qText.toLowerCase()) ? 18 : 0) +
          (String(r.special_requests || "").toLowerCase().includes(qText.toLowerCase()) ? 10 : 0);

        results.push({
          type: "booking",
          id: String(r.id),
          title,
          snippet: makeSnippet(r.special_requests || "", qText),
          score,
          meta: {
            status: r.status,
            tripId: r.trip_id,
            userId: r.user_id,
            created_at: r.created_at,
            popularity: 0,
          },
        });
      }
      facets.bookings = bookingRows.length;
    }

    const sorted = sortResults(results, sort);
    const total = sorted.length;
    const paged = sorted.slice(offset, offset + limit);

    // normalize facets to requested types only
    if (types) {
      for (const k of Object.keys(facets)) {
        if (!types.includes(k)) facets[k] = 0;
      }
    }

    const tookMs = Date.now() - started;
    if (tookMs > 200) {
      console.warn(`[search] slow query took ${tookMs}ms`, { q: qText, types, limit, page });
    }

    res.status(200).json({
      q: qText,
      page,
      limit,
      total,
      facets,
      results: paged,
      tookMs,
    });
  } catch (err) {
    next(err);
  }
});

// Admin-only: expose config
router.get("/admin/search/config", auth, isAdmin, async (req, res) => {
  res.status(200).json({ provider: process.env.SEARCH_PROVIDER || "mysql" });
});

module.exports = router;
