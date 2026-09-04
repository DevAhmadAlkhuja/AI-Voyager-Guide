const express = require("express");
const bcrypt = require("bcrypt");

const { auth } = require("../middleware/auth");
const { signAccessToken } = require("../utils/tokens");
const { assertEmail, assertPassword, assertName } = require("../utils/validators");
const { q, toUserDto } = require("../db/helpers");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone, profileImageUrl } = req.body || {};

    assertName(name);
    assertEmail(email);
    assertPassword(password);

    const emailNorm = email.toLowerCase();
    const existing = await q("SELECT id FROM users WHERE email = :email LIMIT 1", { email: emailNorm });
    if (existing.length) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const rows = await q(
      "INSERT INTO users (name, email, password_hash, phone, profile_image_url, role, settings, last_activity_at) " +
        "VALUES (:name, :email, :password_hash, :phone, :profile_image_url, 'user', JSON_OBJECT(), CURRENT_TIMESTAMP)",
      {
        name: name.trim(),
        email: emailNorm,
        password_hash: passwordHash,
        phone: phone || null,
        profile_image_url: profileImageUrl || null,
      },
    );

    const userId = rows.insertId;
    const userRow = await q(
      "SELECT id, name, first_name, last_name, email, phone, profile_image, profile_image_url, date_of_birth, gender, country, city, address, postal_code, language, bio, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users WHERE id = :id LIMIT 1",
      { id: userId },
    );
    const user = toUserDto(userRow[0]);
    const token = signAccessToken({ id: user.id, role: user.role, email: user.email, name: user.name });

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    assertEmail(email);
    assertPassword(password);

    const emailNorm = email.toLowerCase();
    const rows = await q(
      "SELECT id, name, first_name, last_name, email, phone, profile_image, profile_image_url, date_of_birth, gender, country, city, address, postal_code, language, bio, role, settings, password_hash, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users WHERE email = :email LIMIT 1",
      { email: emailNorm },
    );
    if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

    const row = rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const user = toUserDto(row);
    const token = signAccessToken({ id: row.id, role: row.role, email: row.email, name: row.name });

    await q(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP, last_activity_at = CURRENT_TIMESTAMP WHERE id = :id",
      { id: row.id },
    );
    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.get("/me", auth, async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
