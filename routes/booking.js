const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middlewares.js");
const bookingController = require("../controllers/bookings.js");

// User bookings list
router.get("/bookings", isLoggedIn, wrapAsync(bookingController.index));

// Create reservation for a listing
router.post("/listings/:id/reserve", isLoggedIn, wrapAsync(bookingController.createBooking));
router.post("/listings/:id/bookings", isLoggedIn, wrapAsync(bookingController.createBooking));

// Cancel reservation
router.delete("/bookings/:bookingId", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
