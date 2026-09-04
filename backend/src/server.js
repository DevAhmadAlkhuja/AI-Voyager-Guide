const express = require("express");
const cors = require("cors");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { connectDb, getPool } = require("./db/pool");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");
const adminContactRoutes = require("./routes/adminContactRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userDashboardRoutes = require("./routes/userDashboardRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const tripPlansRoutes = require("./routes/tripPlansRoutes");
const adminDestinationsCmsRoutes = require("./routes/adminDestinationsCmsRoutes");
const publicDestinationsCmsRoutes = require("./routes/publicDestinationsCmsRoutes");
const adminUploadsRoutes = require("./routes/adminUploadsRoutes");
const publicRoutes = require("./routes/publicRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const searchRoutes = require("./routes/searchRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const aiSuggestionsRoutes = require("./routes/aiSuggestionsRoutes");

const app = express();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0) return callback(null, true);

      const normalized = origin
        .replace("http://127.0.0.1", "http://localhost")
        .replace("https://127.0.0.1", "https://localhost");

      const ok = allowedOrigins.includes(origin) || allowedOrigins.includes(normalized);
      return callback(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));

const uploadsRoot = path.join(__dirname, "..", "uploads");
try {
  fs.mkdirSync(path.join(uploadsRoot, "avatars"), { recursive: true });
} catch (e) {
  // ignore
}
app.use("/uploads", express.static(uploadsRoot));

app.get("/", (req, res) => {
  res.status(200).json({ ok: true, message: "Backend is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userDashboardRoutes);
app.use("/api/user", userProfileRoutes);

// CMS Destinations + uploads routes (mounted early to take precedence)
app.use("/api", adminUploadsRoutes);
app.use("/api", adminDestinationsCmsRoutes);
app.use("/api", publicDestinationsCmsRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin", adminManagementRoutes);
app.use("/api/admin/contact", adminContactRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", tripPlansRoutes);
app.use("/api", publicRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api", searchRoutes);
app.use("/api", eventsRoutes);
app.use("/api", aiSuggestionsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

const port = Number(process.env.PORT || 5000);

async function applySchema() {
  const schemaPath = path.join(__dirname, "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pool = getPool();
  for (const stmt of statements) {
    await pool.query(stmt);
  }

  // Lightweight migrations runner (executes *.sql files in src/db/migrations once)
  await pool.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (" +
      "id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
      "filename VARCHAR(255) NOT NULL UNIQUE," +
      "applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP" +
      ")",
  );

  const migrationsDir = path.join(__dirname, "db", "migrations");
  let migrationFiles = [];
  try {
    migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.toLowerCase().endsWith(".sql"))
      .sort();
  } catch {
    migrationFiles = [];
  }

  for (const filename of migrationFiles) {
    const applied = await pool.query(
      "SELECT filename FROM schema_migrations WHERE filename = ? LIMIT 1",
      [filename],
    );
    const alreadyApplied = Array.isArray(applied?.[0]) && applied[0].length > 0;
    if (alreadyApplied) continue;

    const filePath = path.join(migrationsDir, filename);
    const msql = fs.readFileSync(filePath, "utf8");
    const mstatements = msql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of mstatements) {
      await pool.query(stmt);
    }

    await pool.query("INSERT INTO schema_migrations (filename) VALUES (?)", [filename]);
  }

  await pool.query(
    "CREATE TABLE IF NOT EXISTS contact_messages (" +
      "id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
      "user_id INT UNSIGNED NULL," +
      "name VARCHAR(255) NULL," +
      "email VARCHAR(255) NULL," +
      "topic VARCHAR(255) NOT NULL," +
      "message TEXT NOT NULL," +
      "trip_id INT UNSIGNED NULL," +
      "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
      "CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL," +
      "CONSTRAINT fk_contact_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL" +
      ")",
  );

  await pool.query(
    "CREATE TABLE IF NOT EXISTS user_activity (" +
      "id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
      "user_id INT UNSIGNED NOT NULL," +
      "action_type ENUM('view_trip','book_trip','contact') NOT NULL," +
      "trip_id INT UNSIGNED NULL," +
      "destination_id INT UNSIGNED NULL," +
      "booking_id INT UNSIGNED NULL," +
      "contact_message_id INT UNSIGNED NULL," +
      "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
      "CONSTRAINT fk_user_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
      "CONSTRAINT fk_user_activity_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL," +
      "CONSTRAINT fk_user_activity_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL," +
      "CONSTRAINT fk_user_activity_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL," +
      "CONSTRAINT fk_user_activity_contact FOREIGN KEY (contact_message_id) REFERENCES contact_messages(id) ON DELETE SET NULL," +
      "INDEX idx_user_activity_user_created (user_id, created_at)," +
      "INDEX idx_user_activity_action_created (action_type, created_at)" +
      ")",
  );

  await pool.query(
    "CREATE TABLE IF NOT EXISTS trip_plans (" +
      "id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
      "user_id INT UNSIGNED NOT NULL," +
      "trip_title VARCHAR(255) NOT NULL," +
      "destination VARCHAR(255) NOT NULL," +
      "start_date DATE NULL," +
      "end_date DATE NULL," +
      "travelers_count INT UNSIGNED NOT NULL DEFAULT 1," +
      "estimated_budget DECIMAL(12,2) NULL," +
      "contact_phone VARCHAR(50) NULL," +
      "contact_email VARCHAR(255) NULL," +
      "special_requests TEXT NULL," +
      "status ENUM('planned','confirmed','cancelled') NOT NULL DEFAULT 'planned'," +
      "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
      "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
      "CONSTRAINT fk_trip_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
      "INDEX idx_trip_plans_user_created (user_id, created_at)," +
      "INDEX idx_trip_plans_status_created (status, created_at)" +
      ")",
  );

  // Lightweight migration: older tables may use passwordHash instead of password_hash
  const dbName = process.env.DB_NAME;
  const [passwordHashCol] = await pool.query(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash'",
    [dbName],
  );
  const hasPasswordHash = (passwordHashCol?.[0]?.cnt || 0) > 0;

  if (!hasPasswordHash) {
    await pool.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''");

    const [legacyCol] = await pool.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'passwordHash'",
      [dbName],
    );
    const hasLegacy = (legacyCol?.[0]?.cnt || 0) > 0;
    if (hasLegacy) {
      await pool.query("UPDATE users SET password_hash = passwordHash WHERE password_hash = ''");
    }
  }

  const [createdAtCol] = await pool.query(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'created_at'",
    [dbName],
  );
  const hasCreatedAt = (createdAtCol?.[0]?.cnt || 0) > 0;
  if (!hasCreatedAt) {
    await pool.query(
      "ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    );

    const [legacyCreatedAtCol] = await pool.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'createdAt'",
      [dbName],
    );
    const hasLegacyCreatedAt = (legacyCreatedAtCol?.[0]?.cnt || 0) > 0;
    if (hasLegacyCreatedAt) {
      await pool.query("UPDATE users SET created_at = createdAt WHERE created_at IS NULL");
    }
  }

  const [lastSeenCol] = await pool.query(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_seen'",
    [dbName],
  );
  const hasLastSeen = (lastSeenCol?.[0]?.cnt || 0) > 0;
  if (!hasLastSeen) {
    await pool.query("ALTER TABLE users ADD COLUMN last_seen TIMESTAMP NULL DEFAULT NULL");

    const [legacyLastSeenCol] = await pool.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'lastSeen'",
      [dbName],
    );
    const hasLegacyLastSeen = (legacyLastSeenCol?.[0]?.cnt || 0) > 0;
    if (hasLegacyLastSeen) {
      await pool.query("UPDATE users SET last_seen = lastSeen WHERE last_seen IS NULL");
    }
  }

  const [settingsCol] = await pool.query(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'settings'",
    [dbName],
  );
  const hasSettings = (settingsCol?.[0]?.cnt || 0) > 0;
  if (!hasSettings) {
    await pool.query("ALTER TABLE users ADD COLUMN settings JSON NOT NULL");
    await pool.query("UPDATE users SET settings = JSON_OBJECT() WHERE settings IS NULL");
  }

  const ensureUserColumn = async (columnName, ddl) => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?",
      [dbName, columnName],
    );
    const exists = (rows?.[0]?.cnt || 0) > 0;
    if (!exists) {
      await pool.query(ddl);
    }
  };

  await ensureUserColumn("phone", "ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL");
  await ensureUserColumn("profile_image_url", "ALTER TABLE users ADD COLUMN profile_image_url TEXT NULL");
  await ensureUserColumn("profile_image", "ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL");
  await ensureUserColumn("first_name", "ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NULL");
  await ensureUserColumn("last_name", "ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NULL");
  await ensureUserColumn("date_of_birth", "ALTER TABLE users ADD COLUMN date_of_birth DATE NULL");
  await ensureUserColumn("gender", "ALTER TABLE users ADD COLUMN gender ENUM('male','female','other') NULL");
  await ensureUserColumn("country", "ALTER TABLE users ADD COLUMN country VARCHAR(100) NULL");
  await ensureUserColumn("city", "ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL");
  await ensureUserColumn("address", "ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL");
  await ensureUserColumn("postal_code", "ALTER TABLE users ADD COLUMN postal_code VARCHAR(20) NULL");
  await ensureUserColumn("language", "ALTER TABLE users ADD COLUMN language VARCHAR(50) NULL");
  await ensureUserColumn("bio", "ALTER TABLE users ADD COLUMN bio TEXT NULL");

  const ensureBookingColumn = async (columnName, ddl) => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = ?",
      [dbName, columnName],
    );
    const exists = (rows?.[0]?.cnt || 0) > 0;
    if (!exists) {
      await pool.query(ddl);
    }
  };

  await ensureBookingColumn("full_name", "ALTER TABLE bookings ADD COLUMN full_name VARCHAR(255) NULL");
  await ensureBookingColumn("email", "ALTER TABLE bookings ADD COLUMN email VARCHAR(255) NULL");
  await ensureBookingColumn("phone", "ALTER TABLE bookings ADD COLUMN phone VARCHAR(50) NULL");
  await ensureBookingColumn("selected_date", "ALTER TABLE bookings ADD COLUMN selected_date DATE NULL");
  await ensureBookingColumn("special_requests", "ALTER TABLE bookings ADD COLUMN special_requests TEXT NULL");
}

connectDb()
  .then(() => {
    return applySchema();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

