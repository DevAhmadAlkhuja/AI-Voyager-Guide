const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
const destinationsDir = path.join(uploadsRoot, "destinations");

try {
  fs.mkdirSync(destinationsDir, { recursive: true });
} catch {
  // ignore
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destinationsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
  cb(ok ? null : new Error("Invalid file type"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

router.post(
  "/admin/uploads/destination-image",
  auth,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "image is required" });

    const urlPath = `/uploads/destinations/${file.filename}`;
    res.status(201).json({ url: urlPath });
  },
);

module.exports = router;
