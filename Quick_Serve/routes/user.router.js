const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const userValidator = require("../validators/user.validator");
const authMiddleware = require("../middlewares/auth.middleware");

// Routes
router
  .route("/login")
  .post(
    userValidator.validateUserForLogin,
    userValidator.handleValidationErrors,
    userController.login
  );

router
  .route("/signup")
  .post(
    userValidator.validateUserForSignup,
    userValidator.handleValidationErrors,
    userController.signup
  );

router
  .route("/profile")
  .get(
    authMiddleware.checkUserAuth,
    userController.getProfile
  )
  .put(
    authMiddleware.checkUserAuth,
    userController.updateProfile
  );

module.exports = router;
