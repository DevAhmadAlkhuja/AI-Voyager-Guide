const express = require("express");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { q } = require("../db/helpers");

const router = express.Router();

router.get("/messages", auth, isAdmin, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT cm.id, cm.user_id, cm.name, cm.email, cm.topic, cm.message, cm.trip_id, cm.created_at, " +
        "u.name as user_name, u.email as user_email " +
        "FROM contact_messages cm " +
        "LEFT JOIN users u ON u.id = cm.user_id " +
        "ORDER BY cm.created_at DESC",
    );

    const topicStats = await q(
      "SELECT topic, COUNT(*) as cnt FROM contact_messages GROUP BY topic ORDER BY cnt DESC",
    );

    res.status(200).json({ messages: rows, topicStats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
