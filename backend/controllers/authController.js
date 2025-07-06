const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../utils/database");
const { users } = require("../shared/schema.js");
const { eq } = require("drizzle-orm");
const { ValidationError, AuthenticationError } = require("../utils/errors");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUser) {
            throw new ValidationError("Username already exists");
        }

        const [existingEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingEmail) {
            throw new ValidationError("Email already exists");
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [newUser] = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
            })
            .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt
            });

        const token = generateToken(newUser.id);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
            token
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            throw new AuthenticationError("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationError("Invalid credentials");
        }

        const token = generateToken(user.id);

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile
};
