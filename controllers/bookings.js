const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { sendBookingReceipt } = require("../utils/mailer.js");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const { checkIn, checkOut, guests = 1 } = req.body.booking || {};

  if (!checkIn || !checkOut) {
    req.flash("error", "Please select valid check-in and check-out dates!");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    req.flash("error", "Invalid date format!");
    return res.redirect(`/listings/${id}`);
  }

  if (checkInDate < today) {
    req.flash("error", "Check-in date cannot be in the past!");
    return res.redirect(`/listings/${id}`);
  }

  if (checkOutDate <= checkInDate) {
    req.flash("error", "Check-out date must be after check-in date!");
    return res.redirect(`/listings/${id}`);
  }

  // Check for date overlaps with existing confirmed bookings
  const overlappingBooking = await Booking.findOne({
    listing: id,
    status: "Confirmed",
    $or: [
      { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
    ],
  });

  if (overlappingBooking) {
    req.flash("error", "Sorry, these dates are already reserved! Please select different dates.");
    return res.redirect(`/listings/${id}`);
  }

  // Calculate nights & total price (+18% GST)
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const basePrice = listing.price * nights;
  const totalPrice = Math.round(basePrice * 1.18);

  const newBooking = new Booking({
    listing: id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: parseInt(guests) || 1,
    totalPrice,
    status: "Confirmed",
  });

  await newBooking.save();

  // Send Booking Receipt Email asynchronously
  if (req.user.email) {
    sendBookingReceipt({
      to: req.user.email,
      username: req.user.username,
      booking: newBooking,
      listing,
    }).catch((e) => console.error(e));
  }

  req.flash("success", `Booking confirmed for ${nights} night(s)! Total: ₹${totalPrice.toLocaleString("en-IN")}`);
  res.redirect("/bookings");
};

module.exports.index = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/bookings");
  }

  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You do not have permission to cancel this booking!");
    return res.redirect("/bookings");
  }

  booking.status = "Cancelled";
  await booking.save();

  req.flash("success", "Reservation cancelled successfully!");
  res.redirect("/bookings");
};
