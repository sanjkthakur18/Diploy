const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: {
                message: "Validation failed",
                details: errors.array()
            }
        });
    }
    next();
};

const userRegistrationValidation = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Username must be between 3 and 50 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

const userLoginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required"),
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

const productValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ max: 255 })
        .withMessage("Product name must be less than 255 characters"),
    body("description")
        .optional()
        .trim(),
    body("price")
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage("Price must be a valid decimal with up to 2 decimal places")
        .custom((value) => {
            if (parseFloat(value) <= 0) {
                throw new Error("Price must be greater than 0");
            }
            return true;
        }),
    body("imageUrl")
        .optional()
        .isURL()
        .withMessage("Image URL must be a valid URL"),
];

const productUpdateValidation = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Product name cannot be empty")
        .isLength({ max: 255 })
        .withMessage("Product name must be less than 255 characters"),
    body("description")
        .optional()
        .trim(),
    body("price")
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage("Price must be a valid decimal with up to 2 decimal places")
        .custom((value) => {
            if (value !== undefined && parseFloat(value) <= 0) {
                throw new Error("Price must be greater than 0");
            }
            return true;
        }),
    body("imageUrl")
        .optional()
        .isURL()
        .withMessage("Image URL must be a valid URL"),
];

module.exports = {
    validateRequest,
    userRegistrationValidation,
    userLoginValidation,
    productValidation,
    productUpdateValidation
};
