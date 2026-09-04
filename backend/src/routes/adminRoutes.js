const express = require("express");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { q, toUserDto } = require("../db/helpers");

const router = express.Router();

router.get("/users", auth, isAdmin, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT " +
        "u.id, u.name, u.email, u.role, u.settings, u.created_at, u.last_seen, " +
        "(SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) as total_bookings, " +
        "(SELECT d.name FROM bookings b " +
        "  JOIN trips tr ON tr.id = b.trip_id " +
        "  JOIN destinations d ON d.id = tr.destination_id " +
        "  WHERE b.user_id = u.id " +
        "  GROUP BY d.id " +
        "  ORDER BY COUNT(*) DESC " +
        "  LIMIT 1) as most_booked_destination, " +
        "(SELECT a.name FROM bookings b " +
        "  JOIN trip_activities ta ON ta.trip_id = b.trip_id " +
        "  JOIN activities a ON a.id = ta.activity_id " +
        "  WHERE b.user_id = u.id " +
        "  GROUP BY a.id " +
        "  ORDER BY COUNT(*) DESC " +
        "  LIMIT 1) as most_booked_activity " +
        "FROM users u " +
        "ORDER BY u.created_at DESC",
    );
    res.status(200).json({ users: rows.map(toUserDto) });
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await q("DELETE FROM users WHERE id = :id", { id });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.put("/users/:id/role", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ message: "role must be 'user' or 'admin'" });
    }

    const result = await q("UPDATE users SET role = :role WHERE id = :id", { id, role });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    const rows = await q(
      "SELECT id, name, email, role, settings, created_at, last_seen FROM users WHERE id = :id LIMIT 1",
      { id },
    );
    res.status(200).json({ user: toUserDto(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard-stats", auth, isAdmin, async (req, res, next) => {
  try {
    const totalUsersRows = await q("SELECT COUNT(*) as cnt FROM users");
    const totalAdminsRows = await q("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'");
    const newestUsersRows = await q(
      "SELECT id, name, email, role, settings, created_at, last_seen FROM users ORDER BY created_at DESC LIMIT 5",
    );

    res.status(200).json({
      totalUsers: totalUsersRows[0]?.cnt || 0,
      totalAdmins: totalAdminsRows[0]?.cnt || 0,
      newestUsers: newestUsersRows.map(toUserDto),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/users/:id/analytics", auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const userRows = await q(
      "SELECT id, name, email, role, settings, created_at, last_seen FROM users WHERE id = :id LIMIT 1",
      { id },
    );
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const totalBookingsRows = await q("SELECT COUNT(*) as cnt FROM bookings WHERE user_id = :id", { id });

    const mostBookedDestinationRows = await q(
      "SELECT d.id, d.name, COUNT(*) as cnt " +
        "FROM bookings b " +
        "JOIN trips tr ON tr.id = b.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "WHERE b.user_id = :id " +
        "GROUP BY d.id " +
        "ORDER BY cnt DESC " +
        "LIMIT 1",
      { id },
    );

    const mostBookedActivityRows = await q(
      "SELECT a.id, a.name, COUNT(*) as cnt " +
        "FROM bookings b " +
        "JOIN trip_activities ta ON ta.trip_id = b.trip_id " +
        "JOIN activities a ON a.id = ta.activity_id " +
        "WHERE b.user_id = :id " +
        "GROUP BY a.id " +
        "ORDER BY cnt DESC " +
        "LIMIT 1",
      { id },
    );

    res.status(200).json({
      user: toUserDto(userRows[0]),
      totalBookings: totalBookingsRows[0]?.cnt || 0,
      mostBookedDestination: mostBookedDestinationRows[0] || null,
      mostBookedActivity: mostBookedActivityRows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
