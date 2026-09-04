require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { connectDb, getPool } = require("../db/pool");
const { q } = require("../db/helpers");

async function applySchema() {
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
}

async function seedDemoData() {
  await connectDb();
  await applySchema();

  const destCount = await q("SELECT COUNT(*) as cnt FROM destinations");
  if ((destCount[0]?.cnt || 0) > 0) {
    console.log("Demo data already exists.");
    process.exit(0);
  }

  const d1 = await q(
    "INSERT INTO destinations (name, description, location, popularity_score) VALUES (:name, :description, :location, :popularity_score)",
    {
      name: "Kuala Lumpur",
      description: "Capital city destination",
      location: "Malaysia",
      popularity_score: 85,
    },
  );

  const d2 = await q(
    "INSERT INTO destinations (name, description, location, popularity_score) VALUES (:name, :description, :location, :popularity_score)",
    {
      name: "Penang",
      description: "Island destination",
      location: "Malaysia",
      popularity_score: 75,
    },
  );

  const a1 = await q(
    "INSERT INTO activities (destination_id, name, description, price, duration) VALUES (:destination_id, :name, :description, :price, :duration)",
    {
      destination_id: d1.insertId,
      name: "City Tour",
      description: "Guided tour",
      price: 50,
      duration: "3h",
    },
  );

  const a2 = await q(
    "INSERT INTO activities (destination_id, name, description, price, duration) VALUES (:destination_id, :name, :description, :price, :duration)",
    {
      destination_id: d1.insertId,
      name: "Food Market",
      description: "Street food",
      price: 30,
      duration: "2h",
    },
  );

  const trip = await q(
    "INSERT INTO trips (destination_id, start_date, end_date, capacity, base_price) VALUES (:destination_id, :start_date, :end_date, :capacity, :base_price)",
    {
      destination_id: d1.insertId,
      start_date: "2026-03-01",
      end_date: "2026-03-05",
      capacity: 20,
      base_price: 200,
    },
  );

  await q(
    "INSERT INTO trip_activities (trip_id, activity_id) VALUES (:trip_id, :activity_id)",
    { trip_id: trip.insertId, activity_id: a1.insertId },
  );
  await q(
    "INSERT INTO trip_activities (trip_id, activity_id) VALUES (:trip_id, :activity_id)",
    { trip_id: trip.insertId, activity_id: a2.insertId },
  );

  console.log("Seeded demo destinations, activities, and trips.");
  process.exit(0);
}

seedDemoData().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
