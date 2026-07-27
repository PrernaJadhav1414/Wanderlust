const nodemailer = require("nodemailer");

// Create Nodemailer transport (uses SMTP config from .env or fallback test transporter)
function getTransporter() {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback console / test transporter for development environment
  return {
    sendMail: async (options) => {
      console.log("--------------------------------------------------");
      console.log("📧 [TRANSACTIONAL EMAIL SIMULATION]");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Content:", options.text || options.html);
      console.log("--------------------------------------------------");
      return { messageId: "simulated-id-" + Date.now() };
    },
  };
}

const transporter = getTransporter();
const FROM_EMAIL = process.env.EMAIL_FROM || '"WanderLust Support" <no-reply@wanderlust.com>';

/**
 * Send Welcome Email upon User Registration
 */
module.exports.sendWelcomeEmail = async ({ to, username }) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #fe424d; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Welcome to WanderLust! 🏖️</h1>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <p>Hi <strong>${username}</strong>,</p>
          <p>We are thrilled to have you join the WanderLust community! Explore unique staycations, beachfront cabins, cozy mountain retreats, and unforgettable experiences across the world.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:8080'}/listings" 
               style="background-color: #fe424d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Explore Stays Now
            </a>
          </p>
          <p>Happy Traveling,<br>The WanderLust Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to WanderLust! 🏖️ Your Journey Begins Here",
      html,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err.message);
  }
};

/**
 * Send Booking Confirmation & Receipt
 */
module.exports.sendBookingReceipt = async ({ to, username, booking, listing }) => {
  try {
    const checkInStr = new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const checkOutStr = new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const priceStr = booking.totalPrice ? booking.totalPrice.toLocaleString('en-IN') : '0';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #198754; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Reservation Confirmed! 🎉</h1>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <p>Hi <strong>${username}</strong>,</p>
          <p>Your reservation at <strong>${listing.title}</strong> has been confirmed. Below are your booking receipt details:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>Property:</strong></td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${listing.title} (${listing.location}, ${listing.country})</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>Check-in:</strong></td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${checkInStr}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>Check-out:</strong></td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${checkOutStr}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.guests} Guest(s)</td>
            </tr>
            <tr>
              <td style="padding: 12px;"><strong>Total Paid (inc. GST):</strong></td>
              <td style="padding: 12px; color: #198754; font-weight: bold; font-size: 16px;">₹ ${priceStr}</td>
            </tr>
          </table>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:8080'}/bookings" 
               style="background-color: #198754; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               View My Reservations
            </a>
          </p>
          <p>We wish you a fantastic stay!<br>The WanderLust Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `Booking Confirmed: ${listing.title} 🎉`,
      html,
    });
  } catch (err) {
    console.error("Failed to send booking receipt email:", err.message);
  }
};

/**
 * Send Password Reset Token Email
 */
module.exports.sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #212529; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 24px; color: #333; line-height: 1.6;">
          <p>Hi <strong>${username}</strong>,</p>
          <p>You are receiving this email because you (or someone else) requested to reset the password for your WanderLust account.</p>
          <p>Please click the button below to reset your password. This link is valid for 1 hour:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #fe424d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Reset My Password
            </a>
          </p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>Regards,<br>The WanderLust Support Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "WanderLust Password Reset Request 🔑",
      html,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
  }
};
