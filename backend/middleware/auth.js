const jwt = require("jsonwebtoken");
const { db } = require("../utils/database");
const { users } = require("../shared/schema.js");
const { eq } = require("drizzle-orm");
const { AuthenticationError } = require("../utils/errors");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new AuthenticationError("No token provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [user] = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt
            })
            .from(users)
            .where(eq(users.id, decoded.id))
            .limit(1);

        if (!user) {
            throw new AuthenticationError("User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            next(new AuthenticationError("Invalid token"));
        } else if (error.name === "TokenExpiredError") {
            next(new AuthenticationError("Token expired"));
        } else {
            next(error);
        }
    }
};

module.exports = authMiddleware;
