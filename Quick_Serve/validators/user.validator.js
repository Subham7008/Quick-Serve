const { body, validationResult } = require("express-validator");
const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");

const userValidator = {};

userValidator.validateUserForLogin = [
  body("user_name").notEmpty().withMessage("User name is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

userValidator.validateUserForSignup = [
  body("user_name")
    .notEmpty().withMessage("User name is required")
    .isLength({ min: 3 }).withMessage("User name must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("User name can only contain letters, numbers and underscores"),
  body("first_name")
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2 }).withMessage("First name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/).withMessage("First name can only contain letters and spaces"),
  body("last_name")
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/).withMessage("Last name can only contain letters and spaces"),
  body("business_name")
    .notEmpty().withMessage("Business name is required")
    .isLength({ min: 2 }).withMessage("Business name must be at least 2 characters long"),
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")
];

userValidator.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.error(
      HttpStatus.UNPROCESSABLE_ENTITY,
      "false",
      ResponseMessages.VALIDATION_ERROR,
      errors.array()
    );
  }
  next();
};

module.exports = userValidator;
