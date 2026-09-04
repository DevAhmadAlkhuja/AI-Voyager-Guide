const express = require("express");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");
const { q, toUserDto } = require("../db/helpers");
const { assertPassword, assertName } = require("../utils/validators");

const router = express.Router();

router.get("/me", auth, async (req, res, next) => {
  try {
    const rows = await q(
      "SELECT id, name, first_name, last_name, email, phone, profile_image, profile_image_url, date_of_birth, gender, country, city, address, postal_code, language, bio, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users WHERE id = :id LIMIT 1",
      { id: req.user.id },
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: toUserDto(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.put("/me", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, profileImageUrl } = req.body || {};

    if (name !== undefined) {
      assertName(name);
    }

    await q(
      "UPDATE users SET name = COALESCE(:name, name), phone = COALESCE(:phone, phone), profile_image_url = COALESCE(:profile_image_url, profile_image_url) WHERE id = :id",
      {
        id: userId,
        name: name === undefined ? null : String(name).trim(),
        phone: phone === undefined ? null : (phone || null),
        profile_image_url: profileImageUrl === undefined ? null : (profileImageUrl || null),
      },
    );

    const rows = await q(
      "SELECT id, name, first_name, last_name, email, phone, profile_image, profile_image_url, date_of_birth, gender, country, city, address, postal_code, language, bio, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users WHERE id = :id LIMIT 1",
      { id: userId },
    );
    return res.status(200).json({ user: toUserDto(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.put("/me/password", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body || {};

    if (typeof currentPassword !== "string") {
      return res.status(400).json({ message: "currentPassword is required" });
    }
    assertPassword(newPassword);

    const rows = await q(
      "SELECT id, password_hash FROM users WHERE id = :id LIMIT 1",
      { id: userId },
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await q("UPDATE users SET password_hash = :password_hash WHERE id = :id", {
      id: userId,
      password_hash: passwordHash,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/settings", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const settings = req.body?.settings;
    if (settings === undefined || typeof settings !== "object" || settings === null) {
      return res.status(400).json({ message: "settings must be an object" });
    }

    await q("UPDATE users SET settings = :settings WHERE id = :id", {
      id,
      settings: JSON.stringify(settings),
    });

    const rows = await q(
      "SELECT id, name, email, role, settings, created_at, last_seen FROM users WHERE id = :id LIMIT 1",
      { id },
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user: toUserDto(rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
