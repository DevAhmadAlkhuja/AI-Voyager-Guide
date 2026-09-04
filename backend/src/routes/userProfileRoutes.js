const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { auth } = require("../middleware/auth");
const { q, toUserDto } = require("../db/helpers");
const { assertEmail, assertName } = require("../utils/validators");

const router = express.Router();

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");

try {
  fs.mkdirSync(avatarsDir, { recursive: true });
} catch (e) {
  // ignore
}

function safeTrim(v) {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

function assertMaxLen(field, val, max) {
  if (val === null || val === undefined) return;
  if (typeof val !== "string") return;
  if (val.length > max) {
    const err = new Error(`${field} is too long`);
    err.statusCode = 400;
    throw err;
  }
}

function sanitizeGender(g) {
  if (g === null || g === undefined || g === "") return null;
  if (g !== "male" && g !== "female" && g !== "other") {
    const err = new Error("Invalid gender");
    err.statusCode = 400;
    throw err;
  }
  return g;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = file.mimetype === "image/png" ? ".png" : file.mimetype === "image/webp" ? ".webp" : ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `user-${req.user.id}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_AVATAR_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      const err = new Error("Invalid file type");
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

async function loadUser(userId) {
  const rows = await q(
    "SELECT id, name, first_name, last_name, email, phone, profile_image, profile_image_url, date_of_birth, gender, country, city, address, postal_code, language, bio, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
      "FROM users WHERE id = :id LIMIT 1",
    { id: userId },
  );
  return rows[0] || null;
}

router.get("/profile", auth, async (req, res, next) => {
  try {
    const row = await loadUser(req.user.id);
    if (!row) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: toUserDto(row) });
  } catch (err) {
    next(err);
  }
});

router.put("/profile", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    const firstName = safeTrim(body.firstName);
    const lastName = safeTrim(body.lastName);
    const phone = safeTrim(body.phone);
    const email = safeTrim(body.email);
    const country = safeTrim(body.country);
    const city = safeTrim(body.city);
    const address = safeTrim(body.address);
    const postalCode = safeTrim(body.postalCode);
    const language = safeTrim(body.language);
    const bio = safeTrim(body.bio);

    const gender = sanitizeGender(body.gender);

    let dateOfBirth = null;
    if (body.dateOfBirth) {
      const d = new Date(body.dateOfBirth);
      if (Number.isNaN(d.getTime())) {
        const err = new Error("Invalid dateOfBirth");
        err.statusCode = 400;
        throw err;
      }
      dateOfBirth = body.dateOfBirth;
    }

    if (firstName !== null) {
      assertName(firstName);
      assertMaxLen("firstName", firstName, 100);
    }
    if (lastName !== null) {
      assertName(lastName);
      assertMaxLen("lastName", lastName, 100);
    }

    if (email !== null) {
      assertEmail(email);
      const emailNorm = email.toLowerCase();
      const existing = await q(
        "SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1",
        { email: emailNorm, id: userId },
      );
      if (existing.length) return res.status(409).json({ message: "Email already in use" });

      await q("UPDATE users SET email = :email WHERE id = :id", { id: userId, email: emailNorm });
    }

    assertMaxLen("phone", phone || "", 30);
    assertMaxLen("country", country || "", 100);
    assertMaxLen("city", city || "", 100);
    assertMaxLen("address", address || "", 255);
    assertMaxLen("postalCode", postalCode || "", 20);
    assertMaxLen("language", language || "", 50);

    await q(
      "UPDATE users SET first_name = :first_name, last_name = :last_name, phone = :phone, date_of_birth = :date_of_birth, gender = :gender, country = :country, city = :city, address = :address, postal_code = :postal_code, language = :language, bio = :bio, name = :name WHERE id = :id",
      {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone,
        date_of_birth: dateOfBirth,
        gender,
        country,
        city,
        address,
        postal_code: postalCode,
        language,
        bio,
        name: `${firstName || req.user.firstName || ""} ${lastName || req.user.lastName || ""}`.trim() || req.user.name,
      },
    );

    const row = await loadUser(userId);
    return res.status(200).json({ user: toUserDto(row) });
  } catch (err) {
    next(err);
  }
});

router.post("/profile/avatar", auth, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "avatar is required" });

    const userId = req.user.id;
    const newRelPath = `/uploads/avatars/${req.file.filename}`;

    const existingRows = await q(
      "SELECT profile_image, profile_image_url FROM users WHERE id = :id LIMIT 1",
      { id: userId },
    );
    const oldPath = existingRows[0]?.profile_image || existingRows[0]?.profile_image_url || null;

    await q("UPDATE users SET profile_image = :p WHERE id = :id", { id: userId, p: newRelPath });

    if (oldPath && typeof oldPath === "string" && oldPath.startsWith("/uploads/avatars/")) {
      const oldFile = path.join(uploadsRoot, oldPath.replace("/uploads/", ""));
      try {
        fs.unlinkSync(oldFile);
      } catch (e) {
        // ignore
      }
    }

    const row = await loadUser(userId);
    return res.status(200).json({ user: toUserDto(row) });
  } catch (err) {
    next(err);
  }
});

router.delete("/profile/avatar", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existingRows = await q(
      "SELECT profile_image, profile_image_url FROM users WHERE id = :id LIMIT 1",
      { id: userId },
    );
    const oldPath = existingRows[0]?.profile_image || existingRows[0]?.profile_image_url || null;

    await q("UPDATE users SET profile_image = NULL WHERE id = :id", { id: userId });

    if (oldPath && typeof oldPath === "string" && oldPath.startsWith("/uploads/avatars/")) {
      const oldFile = path.join(uploadsRoot, oldPath.replace("/uploads/", ""));
      try {
        fs.unlinkSync(oldFile);
      } catch (e) {
        // ignore
      }
    }

    const row = await loadUser(userId);
    return res.status(200).json({ user: toUserDto(row) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
