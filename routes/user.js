const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middlewares.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

// User Profile Dashboard
router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));
router.post("/profile/edit", isLoggedIn, wrapAsync(userController.updateProfile));

// Wishlist / Saved Favorites routes
router.get("/wishlist", isLoggedIn, wrapAsync(userController.renderWishlist));
router.post("/wishlist/toggle/:id", isLoggedIn, wrapAsync(userController.toggleWishlist));

// Forgot Password routes
router
  .route("/forgot-password")
  .get(userController.renderForgotPasswordForm)
  .post(wrapAsync(userController.sendPasswordResetToken));

// Reset Password routes
router
  .route("/reset-password/:token")
  .get(wrapAsync(userController.renderResetPasswordForm))
  .post(wrapAsync(userController.resetPassword));

module.exports = router;
