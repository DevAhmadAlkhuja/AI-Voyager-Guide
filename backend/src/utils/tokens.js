const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    {
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn,
    },
  );
}

module.exports = { signAccessToken };
