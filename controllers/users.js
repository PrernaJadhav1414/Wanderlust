const User = require("../models/user.js");
const crypto = require("crypto");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/mailer.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    let newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, async (err) => {
      if (err) {
        return next(err);
      }
      // Send Welcome Email (runs asynchronously in background)
      sendWelcomeEmail({ to: registeredUser.email, username: registeredUser.username }).catch((e) => console.error(e));

      req.flash("success", "Welcome to WanderLust! Account created successfully.");
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgot.ejs");
};

module.exports.sendPasswordResetToken = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "No account with that email address exists.");
    return res.redirect("/forgot-password");
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${token}`;
  
  await sendPasswordResetEmail({
    to: user.email,
    username: user.username,
    resetUrl,
  });

  req.flash("success", `An email with password reset instructions has been sent to ${user.email}.`);
  res.redirect("/login");
};

module.exports.renderResetPasswordForm = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/forgot-password");
  }

  res.render("users/reset.ejs", { token });
};

module.exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match!");
    return res.redirect(`/reset-password/${token}`);
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/forgot-password");
  }

  await user.setPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", "Success! Your password has been changed.");
    res.redirect("/listings");
  });
};

const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const listings = await Listing.find({ owner: req.user._id });
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("users/profile.ejs", { user, listings, bookings });
};

module.exports.updateProfile = async (req, res) => {
  const { username, email, phone, bio } = req.body.user || {};
  const user = await User.findById(req.user._id);

  if (username) user.username = username;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  req.flash("success", "Profile updated successfully!");
  res.redirect("/profile");
};

module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  if (!user.wishlist) user.wishlist = [];

  const index = user.wishlist.indexOf(id);
  let isWishlisted = false;

  if (index > -1) {
    user.wishlist.splice(index, 1);
    isWishlisted = false;
  } else {
    user.wishlist.push(id);
    isWishlisted = true;
  }

  await user.save();

  if (req.xhr || req.headers.accept?.includes("json") || req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.json({ success: true, isWishlisted, wishlistCount: user.wishlist.length });
  }

  req.flash("success", isWishlisted ? "Saved to your Wishlist!" : "Removed from your Wishlist.");
  res.redirect(req.headers.referer || "/listings");
};

module.exports.renderWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("users/wishlist.ejs", { wishlist: user.wishlist || [] });
};
