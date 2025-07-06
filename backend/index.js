require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { setupDatabase } = require("./utils/database");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        error: {
            message: err.message || "Internal Server Error",
            status: statusCode
        }
    });
});

app.use("*", (req, res) => {
    res.status(404).json({
        error: {
            message: "Route not found",
            status: 404
        }
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await setupDatabase();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
