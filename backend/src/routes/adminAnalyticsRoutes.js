const express = require("express");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { q, toUserDto } = require("../db/helpers");

const router = express.Router();

router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    const totalUsersRows = await q("SELECT COUNT(*) as cnt FROM users");
    const totalBookingsRows = await q("SELECT COUNT(*) as cnt FROM bookings");
    const activeTripsRows = await q(
      "SELECT COUNT(*) as cnt FROM trips WHERE end_date >= CURDATE()",
    );

    const newUsersTodayRows = await q(
      "SELECT COUNT(*) as cnt FROM users WHERE DATE(created_at) = CURDATE()",
    );
    const newUsersThisMonthRows = await q(
      "SELECT COUNT(*) as cnt FROM users WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())",
    );

    const mostBookedDestinations = await q(
      "SELECT d.id, d.name, d.location, COUNT(*) as bookings " +
        "FROM bookings b " +
        "JOIN trips tr ON tr.id = b.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "GROUP BY d.id " +
        "ORDER BY bookings DESC " +
        "LIMIT 5",
    );

    const recentUsers = await q(
      "SELECT id, name, email, phone, profile_image_url, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users ORDER BY created_at DESC LIMIT 5",
    );

    const recentBookings = await q(
      "SELECT b.id, b.user_id, b.trip_id, b.travelers_count, b.total_price, b.status, b.created_at, " +
        "u.name as user_name, u.email as user_email, d.name as destination_name " +
        "FROM bookings b " +
        "JOIN users u ON u.id = b.user_id " +
        "JOIN trips tr ON tr.id = b.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "ORDER BY b.created_at DESC LIMIT 5",
    );

    const recentContactMessages = await q(
      "SELECT cm.id, cm.user_id, cm.name, cm.email, cm.topic, cm.message, cm.trip_id, cm.created_at " +
        "FROM contact_messages cm ORDER BY cm.created_at DESC LIMIT 5",
    );

    const mostViewedTrips = await q(
      "SELECT tr.id as trip_id, d.name as destination_name, COUNT(*) as views " +
        "FROM user_activity ua " +
        "JOIN trips tr ON tr.id = ua.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "WHERE ua.action_type = 'view_trip' " +
        "GROUP BY tr.id " +
        "ORDER BY views DESC LIMIT 10",
    );

    const mostBookedTrips = await q(
      "SELECT tr.id as trip_id, d.name as destination_name, COUNT(*) as bookings " +
        "FROM bookings b " +
        "JOIN trips tr ON tr.id = b.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "GROUP BY tr.id " +
        "ORDER BY bookings DESC LIMIT 10",
    );

    const contactTopics = await q(
      "SELECT topic, COUNT(*) as cnt FROM contact_messages GROUP BY topic ORDER BY cnt DESC LIMIT 10",
    );

    res.status(200).json({
      stats: {
        totalUsers: Number(totalUsersRows[0]?.cnt || 0),
        newUsersToday: Number(newUsersTodayRows[0]?.cnt || 0),
        newUsersThisMonth: Number(newUsersThisMonthRows[0]?.cnt || 0),
        totalBookings: Number(totalBookingsRows[0]?.cnt || 0),
        activeTrips: Number(activeTripsRows[0]?.cnt || 0),
      },
      mostBookedDestinations,
      recentUsers: recentUsers.map(toUserDto),
      recentBookings,
      recentContactMessages,
      analytics: {
        mostViewedTrips,
        mostBookedTrips,
        contactTopics,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/overview", auth, isAdmin, async (req, res, next) => {
  try {
    const mostViewedDestinations = await q(
      "SELECT d.id, d.name, d.location, COUNT(*) as views " +
        "FROM user_activity_tracking t " +
        "JOIN destinations d ON d.id = t.destination_id " +
        "WHERE t.action_type = 'view' AND t.destination_id IS NOT NULL " +
        "GROUP BY d.id " +
        "ORDER BY views DESC " +
        "LIMIT 5",
    );

    const mostBookedDestinations = await q(
      "SELECT d.id, d.name, d.location, COUNT(*) as bookings " +
        "FROM bookings b " +
        "JOIN trips tr ON tr.id = b.trip_id " +
        "JOIN destinations d ON d.id = tr.destination_id " +
        "GROUP BY d.id " +
        "ORDER BY bookings DESC " +
        "LIMIT 5",
    );

    const mostBookedActivities = await q(
      "SELECT a.id, a.name, COUNT(*) as bookings " +
        "FROM bookings b " +
        "JOIN trip_activities ta ON ta.trip_id = b.trip_id " +
        "JOIN activities a ON a.id = ta.activity_id " +
        "GROUP BY a.id " +
        "ORDER BY bookings DESC " +
        "LIMIT 5",
    );

    const userPreferenceTrends = await q(
      "SELECT d.id as destination_id, d.name as destination_name, COUNT(*) as actions " +
        "FROM user_activity_tracking t " +
        "JOIN destinations d ON d.id = t.destination_id " +
        "WHERE t.destination_id IS NOT NULL " +
        "GROUP BY d.id " +
        "ORDER BY actions DESC " +
        "LIMIT 10",
    );

    res.status(200).json({
      mostViewedDestinations,
      mostBookedDestinations,
      mostBookedActivities,
      userPreferenceTrends,
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

    const totalBookingsRows = await q(
      "SELECT COUNT(*) as cnt FROM bookings WHERE user_id = :id",
      { id },
    );

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
