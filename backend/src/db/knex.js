const knex = require("knex");

let instance;

function getKnex() {
  if (!instance) {
    if (!process.env.DB_NAME) {
      throw new Error("DB_NAME is required");
    }

    instance = knex({
      client: "mysql2",
      connection: {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME,
        timezone: "Z",
      },
      pool: { min: 0, max: 10 },
    });
  }

  return instance;
}

module.exports = { getKnex };
