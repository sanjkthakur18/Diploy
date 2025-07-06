const express = require("express");
const { register, login, getProfile } = require("../controllers/authController");
const { userRegistrationValidation, userLoginValidation, validateRequest } = require("../utils/validation");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", userRegistrationValidation, validateRequest, register);

router.post("/login", userLoginValidation, validateRequest, login);

router.get("/profile", authMiddleware, getProfile);

module.exports = router;
