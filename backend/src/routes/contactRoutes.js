const express = require("express");
const { auth } = require("../middleware/auth");
const { q } = require("../db/helpers");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, topic, message, tripId } = req.body || {};

    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return res.status(400).json({ message: "topic is required" });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return res.status(400).json({ message: "message is required" });
    }

    const insert = await q(
      "INSERT INTO contact_messages (user_id, name, email, topic, message, trip_id) " +
        "VALUES (:user_id, :name, :email, :topic, :message, :trip_id)",
      {
        user_id: null,
        name: name || null,
        email: email || null,
        topic: topic.trim(),
        message: message.trim(),
        trip_id: tripId || null,
      },
    );

    res.status(201).json({ contactMessage: { id: insert.insertId } });
  } catch (err) {
    next(err);
  }
});

router.post("/auth", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topic, message, tripId } = req.body || {};

    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return res.status(400).json({ message: "topic is required" });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return res.status(400).json({ message: "message is required" });
    }

    const insert = await q(
      "INSERT INTO contact_messages (user_id, name, email, topic, message, trip_id) " +
        "VALUES (:user_id, :name, :email, :topic, :message, :trip_id)",
      {
        user_id: userId,
        name: req.user.name || null,
        email: req.user.email || null,
        topic: topic.trim(),
        message: message.trim(),
        trip_id: tripId || null,
      },
    );

    await q(
      "INSERT INTO user_activity (user_id, action_type, trip_id, destination_id, booking_id, contact_message_id) " +
        "VALUES (:user_id, 'contact', :trip_id, NULL, NULL, :contact_message_id)",
      { user_id: userId, trip_id: tripId || null, contact_message_id: insert.insertId },
    );

    res.status(201).json({ contactMessage: { id: insert.insertId } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
