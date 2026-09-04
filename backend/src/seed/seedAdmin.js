const bcrypt = require("bcrypt");
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { connectDb, getPool } = require("../db/pool");
const { q } = require("../db/helpers");

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin12345";
  const name = process.env.ADMIN_NAME || "Default Admin";

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  await connectDb();

  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pool = getPool();
  for (const stmt of statements) {
    await pool.query(stmt);
  }

  const existing = await q("SELECT id FROM users WHERE email = :email LIMIT 1", { email });
  if (existing.length) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await q(
    "INSERT INTO users (name, email, password_hash, role, settings, last_seen) VALUES (:name, :email, :password_hash, 'admin', JSON_OBJECT(), CURRENT_TIMESTAMP)",
    { name, email, password_hash: passwordHash },
  );

  console.log("Admin user created:");
  console.log("email:", email);
  console.log("password:", password);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
