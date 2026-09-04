const express = require("express");
const { auth } = require("../middleware/auth");
const { q } = require("../db/helpers");

const router = express.Router();

router.post("/view", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { destinationId, activityId } = req.body || {};

    if (!destinationId && !activityId) {
      return res.status(400).json({ message: "destinationId or activityId is required" });
    }

    await q(
      "INSERT INTO user_activity_tracking (user_id, destination_id, activity_id, action_type) VALUES (:user_id, :destination_id, :activity_id, 'view')",
      {
        user_id: userId,
        destination_id: destinationId || null,
        activity_id: activityId || null,
      },
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/book", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { destinationId, activityId } = req.body || {};

    await q(
      "INSERT INTO user_activity_tracking (user_id, destination_id, activity_id, action_type) VALUES (:user_id, :destination_id, :activity_id, 'book')",
      {
        user_id: userId,
        destination_id: destinationId || null,
        activity_id: activityId || null,
      },
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
