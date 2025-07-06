const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("../shared/schema.js");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Ensure the database is provisioned");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function setupDatabase() {
    try {
        await pool.query("SELECT 1");
        console.log("Database connection successful");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}

module.exports = { db, setupDatabase };
