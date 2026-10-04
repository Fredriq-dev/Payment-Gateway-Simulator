/**
 * OWNER: Person 1 (Foundation)
 * Shared PostgreSQL connection pool. Everyone imports this file.
 *   const pool = require("../Config/databaseConfig");
 *   const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
 */
require("dotenv").config();
const { Pool, types } = require("pg");

// BIGINT columns (like amount) come back as strings by default. Parse them as numbers.
types.setTypeParser(20, Number);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => console.error("Unexpected database error:", err));

module.exports = pool;
