/**
 * OWNER: Person 1 (Foundation)
 * Runs a SQL file against DATABASE_URL. Works on Windows, Mac and Linux.
 *   npm run db:setup   (runs schema.sql)
 *   npm run db:seed    (runs seed.sql)
 */
const fs = require("fs");
const path = require("path");
const pool = require("../Config/databaseConfig");

const file = process.argv[2] === "seed" ? "seed.sql" : "schema.sql";

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
    await pool.query(sql);
    console.log(`${file} executed successfully`);
  } catch (err) {
    console.error(`Failed to run ${file}:`, err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
