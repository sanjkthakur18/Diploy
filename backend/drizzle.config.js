const { defineConfig } = require("drizzle-kit");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Ensure the database is provisioned");
}

module.exports = defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
