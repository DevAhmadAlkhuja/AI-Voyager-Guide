const express = require("express");
const { auth } = require("../middleware/auth");
const { q, toUserDto } = require("../db/helpers");

const router = express.Router();

router.get("/dashboard", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userRows = await q(
      "SELECT id, name, email, phone, profile_image_url, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users WHERE id = :id LIMIT 1",
      { id: userId },
    );

    const totalBookingsRows = await q(
      "SELECT COUNT(*) as cnt FROM bookings WHERE user_id = :id",
      { id: userId },
    );

    const upcomingTripsRows = await q(
      "SELECT COUNT(*) as cnt " +
        "FROM bookings b JOIN trips tr ON tr.id = b.trip_id " +
        "WHERE b.user_id = :id AND b.status <> 'cancelled' AND tr.start_date >= CURDATE()",
      { id: userId },
    );

    res.status(200).json({
      user: toUserDto(userRows[0]),
      stats: {
        totalBookings: Number(totalBookingsRows[0]?.cnt || 0),
        upcomingTrips: Number(upcomingTripsRows[0]?.cnt || 0),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
