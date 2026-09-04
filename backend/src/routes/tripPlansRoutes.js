const express = require("express");
const { auth } = require("../middleware/auth");
const { q } = require("../db/helpers");

const router = express.Router();

function isValidDateString(v) {
  if (!v) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v));
}

function parseOptionalDate(v) {
  if (v === null || v === undefined || v === "") return null;
  if (!isValidDateString(v)) return undefined;
  return String(v);
}

function parseOptionalNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

router.post("/trip-plans", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      trip_title,
      tripTitle,
      destination,
      start_date,
      startDate,
      end_date,
      endDate,
      travelers_count,
      travelersCount,
      estimated_budget,
      estimatedBudget,
      contact_phone,
      contactPhone,
      contact_email,
      contactEmail,
      special_requests,
      specialRequests,
      status,
    } = req.body || {};

    const title = String(trip_title ?? tripTitle ?? "").trim();
    const dest = String(destination ?? "").trim();
    if (!title) return res.status(400).json({ message: "trip_title is required" });
    if (!dest) return res.status(400).json({ message: "destination is required" });

    const start = parseOptionalDate(start_date ?? startDate);
    if (start === undefined) return res.status(400).json({ message: "start_date must be YYYY-MM-DD" });
    const end = parseOptionalDate(end_date ?? endDate);
    if (end === undefined) return res.status(400).json({ message: "end_date must be YYYY-MM-DD" });
    if (start && end && start > end) return res.status(400).json({ message: "start_date must be <= end_date" });

    const travelersRaw = travelers_count ?? travelersCount;
    const travelers = travelersRaw === undefined || travelersRaw === null || travelersRaw === "" ? 1 : Number(travelersRaw);
    if (!Number.isInteger(travelers) || travelers <= 0) {
      return res.status(400).json({ message: "travelers_count must be a positive integer" });
    }

    const budgetNum = parseOptionalNumber(estimated_budget ?? estimatedBudget);
    if (budgetNum === undefined) return res.status(400).json({ message: "estimated_budget must be a number" });
    if (budgetNum !== null && budgetNum < 0) return res.status(400).json({ message: "estimated_budget must be >= 0" });

    const allowedStatus = new Set(["planned", "confirmed", "cancelled"]);
    const st = status ? String(status) : "planned";
    if (!allowedStatus.has(st)) return res.status(400).json({ message: "status must be planned, confirmed, or cancelled" });

    const phone = String(contact_phone ?? contactPhone ?? req.user.phone ?? "").trim() || null;
    const email = String(contact_email ?? contactEmail ?? req.user.email ?? "").trim() || null;

    const sr = special_requests ?? specialRequests;
    const special = sr === undefined || sr === null || sr === "" ? null : String(sr);

    const insert = await q(
      "INSERT INTO trip_plans (user_id, trip_title, destination, start_date, end_date, travelers_count, estimated_budget, contact_phone, contact_email, special_requests, status) " +
        "VALUES (:user_id, :trip_title, :destination, :start_date, :end_date, :travelers_count, :estimated_budget, :contact_phone, :contact_email, :special_requests, :status)",
      {
        user_id: userId,
        trip_title: title,
        destination: dest,
        start_date: start,
        end_date: end,
        travelers_count: travelers,
        estimated_budget: budgetNum,
        contact_phone: phone,
        contact_email: email,
        special_requests: special,
        status: st,
      },
    );

    const rows = await q(
      "SELECT id, user_id, trip_title, destination, start_date, end_date, travelers_count, estimated_budget, contact_phone, contact_email, special_requests, status, created_at, updated_at " +
        "FROM trip_plans WHERE id = :id AND user_id = :user_id LIMIT 1",
      { id: insert.insertId, user_id: userId },
    );

    res.status(201).json({ tripPlan: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/user/trip-plans", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rows = await q(
      "SELECT id, trip_title, destination, start_date, end_date, travelers_count, estimated_budget, status, created_at, updated_at " +
        "FROM trip_plans WHERE user_id = :user_id ORDER BY created_at DESC",
      { user_id: userId },
    );
    res.status(200).json({ tripPlans: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/user/trip-plans/:id", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const rows = await q(
      "SELECT id, trip_title, destination, start_date, end_date, travelers_count, estimated_budget, contact_phone, contact_email, special_requests, status, created_at, updated_at " +
        "FROM trip_plans WHERE id = :id AND user_id = :user_id LIMIT 1",
      { id, user_id: userId },
    );
    if (!rows.length) return res.status(404).json({ message: "Trip plan not found" });
    res.status(200).json({ tripPlan: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put("/user/trip-plans/:id", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const existing = await q(
      "SELECT id FROM trip_plans WHERE id = :id AND user_id = :user_id LIMIT 1",
      { id, user_id: userId },
    );
    if (!existing.length) return res.status(404).json({ message: "Trip plan not found" });

    const {
      trip_title,
      tripTitle,
      destination,
      start_date,
      startDate,
      end_date,
      endDate,
      travelers_count,
      travelersCount,
      estimated_budget,
      estimatedBudget,
      contact_phone,
      contactPhone,
      contact_email,
      contactEmail,
      special_requests,
      specialRequests,
      status,
    } = req.body || {};

    const title = trip_title !== undefined || tripTitle !== undefined ? String(trip_title ?? tripTitle ?? "").trim() : undefined;
    if (title !== undefined && !title) return res.status(400).json({ message: "trip_title cannot be empty" });

    const dest = destination !== undefined ? String(destination).trim() : undefined;
    if (dest !== undefined && !dest) return res.status(400).json({ message: "destination cannot be empty" });

    const start = start_date !== undefined || startDate !== undefined ? parseOptionalDate(start_date ?? startDate) : undefined;
    if (start === undefined && (start_date !== undefined || startDate !== undefined)) {
      return res.status(400).json({ message: "start_date must be YYYY-MM-DD" });
    }
    const end = end_date !== undefined || endDate !== undefined ? parseOptionalDate(end_date ?? endDate) : undefined;
    if (end === undefined && (end_date !== undefined || endDate !== undefined)) {
      return res.status(400).json({ message: "end_date must be YYYY-MM-DD" });
    }

    const travelersRaw = travelers_count ?? travelersCount;
    const travelers = travelersRaw !== undefined ? Number(travelersRaw) : undefined;
    if (travelers !== undefined && (!Number.isInteger(travelers) || travelers <= 0)) {
      return res.status(400).json({ message: "travelers_count must be a positive integer" });
    }

    const budgetNum = estimated_budget !== undefined || estimatedBudget !== undefined ? parseOptionalNumber(estimated_budget ?? estimatedBudget) : undefined;
    if (budgetNum === undefined && (estimated_budget !== undefined || estimatedBudget !== undefined)) {
      return res.status(400).json({ message: "estimated_budget must be a number" });
    }
    if (budgetNum !== undefined && budgetNum !== null && budgetNum < 0) {
      return res.status(400).json({ message: "estimated_budget must be >= 0" });
    }

    const allowedStatus = new Set(["planned", "confirmed", "cancelled"]);
    const st = status !== undefined ? String(status) : undefined;
    if (st !== undefined && !allowedStatus.has(st)) {
      return res.status(400).json({ message: "status must be planned, confirmed, or cancelled" });
    }

    const phone = contact_phone !== undefined || contactPhone !== undefined ? String(contact_phone ?? contactPhone ?? "").trim() || null : undefined;
    const email = contact_email !== undefined || contactEmail !== undefined ? String(contact_email ?? contactEmail ?? "").trim() || null : undefined;

    const sr = special_requests ?? specialRequests;
    const special = special_requests !== undefined || specialRequests !== undefined ? (sr === null || sr === "" ? null : String(sr)) : undefined;

    const patch = {
      trip_title: title,
      destination: dest,
      start_date: start,
      end_date: end,
      travelers_count: travelers,
      estimated_budget: budgetNum,
      contact_phone: phone,
      contact_email: email,
      special_requests: special,
      status: st,
    };

    const fields = Object.entries(patch).filter(([, v]) => v !== undefined);
    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    const setSql = fields.map(([k]) => `${k} = :${k}`).join(", ");
    const params = Object.fromEntries(fields);
    params.id = id;
    params.user_id = userId;

    await q(`UPDATE trip_plans SET ${setSql} WHERE id = :id AND user_id = :user_id`, params);

    const rows = await q(
      "SELECT id, trip_title, destination, start_date, end_date, travelers_count, estimated_budget, contact_phone, contact_email, special_requests, status, created_at, updated_at " +
        "FROM trip_plans WHERE id = :id AND user_id = :user_id LIMIT 1",
      { id, user_id: userId },
    );

    res.status(200).json({ tripPlan: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/user/trip-plans/:id", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const del = await q(
      "DELETE FROM trip_plans WHERE id = :id AND user_id = :user_id",
      { id, user_id: userId },
    );

    if (!del.affectedRows) return res.status(404).json({ message: "Trip plan not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
