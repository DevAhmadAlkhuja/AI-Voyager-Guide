const express = require("express");
const { auth } = require("../middleware/auth");
const { q } = require("../db/helpers");

const router = express.Router();

router.post("/", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tripId, travelersCount, notes, fullName, email, phone, selectedDate, specialRequests } = req.body || {};

    if (!tripId) return res.status(400).json({ message: "tripId is required" });
    if (!travelersCount || Number(travelersCount) <= 0) {
      return res.status(400).json({ message: "travelersCount must be > 0" });
    }

    const tripRows = await q(
      "SELECT tr.id, tr.destination_id, tr.capacity, tr.base_price, d.name as destination_name " +
        "FROM trips tr JOIN destinations d ON d.id = tr.destination_id WHERE tr.id = :tripId LIMIT 1",
      { tripId },
    );
    if (!tripRows.length) return res.status(404).json({ message: "Trip not found" });

    const trip = tripRows[0];

    const bookedRows = await q(
      "SELECT COALESCE(SUM(travelers_count),0) as booked FROM bookings WHERE trip_id = :tripId AND status <> 'cancelled'",
      { tripId },
    );
    const booked = Number(bookedRows[0]?.booked || 0);

    if (booked + Number(travelersCount) > Number(trip.capacity)) {
      return res.status(400).json({ message: "Trip capacity exceeded" });
    }

    const activityPriceRows = await q(
      "SELECT COALESCE(SUM(a.price),0) as activity_total " +
        "FROM trip_activities ta JOIN activities a ON a.id = ta.activity_id WHERE ta.trip_id = :tripId",
      { tripId },
    );

    const perTraveler = Number(trip.base_price) + Number(activityPriceRows[0]?.activity_total || 0);
    const totalPrice = perTraveler * Number(travelersCount);

    const insert = await q(
      "INSERT INTO bookings (user_id, trip_id, full_name, email, phone, selected_date, travelers_count, total_price, status, notes, special_requests) " +
        "VALUES (:user_id, :trip_id, :full_name, :email, :phone, :selected_date, :travelers_count, :total_price, 'pending', :notes, :special_requests)",
      {
        user_id: userId,
        trip_id: tripId,
        full_name: fullName || req.user.name || null,
        email: email || req.user.email || null,
        phone: phone || req.user.phone || null,
        selected_date: selectedDate || null,
        travelers_count: Number(travelersCount),
        total_price: totalPrice,
        notes: notes || null,
        special_requests: specialRequests || null,
      },
    );

    await q(
      "INSERT INTO user_activity_tracking (user_id, destination_id, activity_id, action_type) VALUES (:user_id, :destination_id, NULL, 'book')",
      { user_id: userId, destination_id: trip.destination_id },
    );

    const bookingRows = await q(
      "SELECT id, user_id, trip_id, travelers_count, total_price, status, notes, created_at FROM bookings WHERE id = :id LIMIT 1",
      { id: insert.insertId },
    );

    res.status(201).json({ booking: bookingRows[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/cancel", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const rows = await q(
      "SELECT id, user_id, trip_id, status, created_at FROM bookings WHERE id = :id LIMIT 1",
      { id },
    );
    if (!rows.length) return res.status(404).json({ message: "Booking not found" });
    const booking = rows[0];

    if (Number(booking.user_id) !== Number(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status === "cancelled") {
      return res.status(200).json({ booking });
    }

    await q("UPDATE bookings SET status = 'cancelled' WHERE id = :id", { id });
    const updated = await q(
      "SELECT id, user_id, trip_id, travelers_count, total_price, status, notes, special_requests, created_at FROM bookings WHERE id = :id LIMIT 1",
      { id },
    );
    return res.status(200).json({ booking: updated[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/my", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rows = await q(
      "SELECT b.id, b.trip_id, b.travelers_count, b.total_price, b.status, b.notes, b.created_at, " +
        "tr.start_date, tr.end_date, tr.base_price, d.name as destination_name, d.location as destination_location " +
        "FROM bookings b " +
        "JOIN trips tr ON tr.id = b.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "WHERE b.user_id = :userId " +
        "ORDER BY b.created_at DESC",
      { userId },
    );

    res.status(200).json({ bookings: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
