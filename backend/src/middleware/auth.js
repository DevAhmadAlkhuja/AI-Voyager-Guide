const jwt = require("jsonwebtoken");
const { q, toUserDto } = require("../db/helpers");

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const rows = await q(
      "SELECT id, name, first_name, last_name, email, phone, profile_image, profile_image_url, date_of_birth, gender, country, city, address, postal_code, language, bio, role, settings, created_at, last_seen, last_login_at, last_activity_at " +
        "FROM users WHERE id = :id LIMIT 1",
      { id: payload.sub },
    );
    const user = toUserDto(rows[0]);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    await q(
      "UPDATE users SET last_seen = CURRENT_TIMESTAMP, last_activity_at = CURRENT_TIMESTAMP WHERE id = :id",
      { id: user.id },
    );

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { auth };
