const express = require("express");
const { q } = require("../db/helpers");

const router = express.Router();

router.get("/destinations", async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT id, name, description, location, popularity_score, created_at FROM destinations ORDER BY popularity_score DESC, created_at DESC",
    );
    res.status(200).json({ destinations: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/trips", async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT tr.id, tr.destination_id, tr.start_date, tr.end_date, tr.capacity, tr.base_price, d.name as destination_name, d.location as destination_location " +
        "FROM trips tr JOIN destinations d ON d.id = tr.destination_id " +
        "ORDER BY tr.start_date ASC",
    );
    res.status(200).json({ trips: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/trips/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const tripRows = await q(
      "SELECT tr.id, tr.destination_id, tr.start_date, tr.end_date, tr.capacity, tr.base_price, d.name as destination_name, d.location as destination_location " +
        "FROM trips tr JOIN destinations d ON d.id = tr.destination_id WHERE tr.id = :id LIMIT 1",
      { id },
    );

    if (!tripRows.length) return res.status(404).json({ message: "Trip not found" });

    const activities = await q(
      "SELECT a.id, a.name, a.description, a.price, a.duration " +
        "FROM trip_activities ta JOIN activities a ON a.id = ta.activity_id WHERE ta.trip_id = :id",
      { id },
    );

    res.status(200).json({ trip: { ...tripRows[0], activities } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
