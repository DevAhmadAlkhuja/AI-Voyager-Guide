const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
  },
);

async function connectDb() {
  if (!process.env.DB_NAME || !process.env.DB_USER) {
    const err = new Error("DB_NAME and DB_USER are required");
    err.statusCode = 500;
    throw err;
  }

  await sequelize.authenticate();
  return sequelize;
}

module.exports = { sequelize, connectDb };
