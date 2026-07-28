# 🏖️ WanderLust — Travel & Vacation Rental Platform

**WanderLust** is a full-stack, responsive web application inspired by Airbnb. It enables users to discover, host, bookmark, and reserve unique staycations, beachfront cottages, mountain cabins, and luxury villas around the globe.

🌐 **Live Website**: [https://wanderlust-0xxd.onrender.com/listings](https://wanderlust-0xxd.onrender.com/listings)

---

## 🚀 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📋 System Architecture & Workflow](#-System-Architecture-&-Workflow)
- [💻 Local Installation & Setup](#-Local-Installation-&-Setup)
- [🔐 Environment Variables](#-Environment-Variables)
- [📁 Folder Structure](#-Folder-Structure)
- [👤 Author](#-Author)

---

## ✨ Key Features

### 🏠 1. Property Management (CRUD) & Category Filters
* **Explore Stays**: Browse listings filtered by 20+ dynamic categories (*Beach, Rooms, Castles, Amazing Pools, Camping, Cabins, Trending, Iconic Cities, Arctic, etc.*).
* **Host Places**: Registered users can upload properties with descriptions, pricing, location, country, category, and images.
* **Real-time Search Engine**: Search properties by Title, Location, Country, Category, or Maximum Price limit.

### 📅 2. Full Booking & Reservation Engine
* **Interactive Date Pickers**: Select check-in/check-out dates with automatic date validation.
* **Live Price Calculator**: Calculates nightly rates, 18% GST tax, and total reservation cost dynamically on the frontend.
* **Double-Booking Prevention**: Backend availability engine prevents overlapping confirmed reservations on the same property.
* **Booking Receipts**: Automatic HTML email receipt sent to users upon reservation confirmation.
* **Reservation Dashboard**: View past and upcoming trips with status badges (`Confirmed` / `Cancelled`) and cancellation capability.

### 👤 3. User Profile & Dashboard (`/profile`)
* **Personal Profile Management**: View and edit username, email, phone number, and personal bio.
* **"My Listings" Tab**: Manage all properties hosted by the user with quick Edit and Delete controls.
* **"My Reservations" Tab**: View trip history and manage current reservations.

### ❤️ 4. Wishlist / Saved Favorites (`/wishlist`)
* **Bookmark Toggle**: Interactive Heart icon buttons on property feed cards and property detail pages.
* **Wishlist Page**: Dedicated dashboard displaying all saved favorite stays.

### 🔒 5. Security & Authentication
* **User Authentication**: Built with Passport.js local strategy and encrypted sessions.
* **Route Protection**: Custom middleware (`isLoggedIn`, `isOwner`, `isReviewAuthor`) guarantees only authorized users can edit or delete resources.
* **Forgot & Reset Password**: Secure token-based password reset system with 1-hour expiration tokens dispatched via email (`/forgot-password` & `/reset-password/:token`).

### ☁️ 6. Cloud Storage & Automatic Asset Cleanup
* **Cloudinary Integration**: Direct image hosting using `multer-storage-cloudinary`.
* **Automatic Storage Cleanup**: Old image files are automatically destroyed from Cloudinary when listings are updated or deleted, avoiding unused storage buildup.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend Framework** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas, Mongoose ODM |
| **Frontend Templates** | EJS (Embedded JavaScript), `ejs-mate` layouts |
| **Styling & UI** | HTML5, Vanilla CSS3, Bootstrap 5, FontAwesome Icons |
| **Authentication** | Passport.js, Passport-Local, Passport-Local-Mongoose, Express-Session |
| **File & Cloud Storage** | Cloudinary, Multer, `multer-storage-cloudinary` |
| **Geocoding & Maps** | OpenStreetMap Nominatim Geocoding API |
| **Email Engine** | Nodemailer (Transactional email notifications) |
| **Deployment** | Render (Web Service Cloud Hosting) |

---

## 🌐 Live Demo

Visit the deployed website live on Render:
👉 **[https://wanderlust-0xxd.onrender.com/listings](https://wanderlust-0xxd.onrender.com/listings)**

*(Note: Render free instances sleep after 15 minutes of inactivity. If the page takes 30-40 seconds to load initially, it is performing a cold start.)*

---

## 💻 Local Installation & Setup

To run WanderLust on your local machine, follow these steps:

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB Atlas Account (or local MongoDB instance)
- Cloudinary Account (for image uploads)

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PrernaJadhav1414/Wanderlust.git
   cd Wanderlust
   ```

2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add:
   ```env
   ATLASDB_URL=your_mongodb_connection_string
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   SECRET=your_session_secret_key
   
   # Optional SMTP Email Settings (for live email dispatch)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_letter_app_password
   EMAIL_FROM="WanderLust Support" <your_email@gmail.com>
   ```

4. **Seed Sample Data (Optional)**:
   ```bash
   node init/index.js
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

6. **Open in Browser**:
   Navigate to `http://localhost:8080/listings`

---

## 📁 Folder Structure

```text
WanderLust/
├── cloudConfig.js          # Cloudinary storage & client configuration
├── app.js                  # Main Express application entry point
├── middlewares.js          # Auth, ownership & validation middlewares
├── models/                 # Database Schemas (User, Listing, Review, Booking)
├── controllers/            # Controller business logic (Listings, Users, Bookings, Reviews)
├── routes/                 # Express route handlers
├── utils/                  # Utility helpers (ExpressError, wrapAsync, Nodemailer mailer)
├── views/                  # EJS Template files (Listings, Users, Bookings, Includes, Layouts)
├── public/                 # Static CSS & Client JavaScript assets
├── package.json            # Dependencies & start scripts
└── README.md               # Project documentation
```

---

## 👤 Author

* **Prerna Jadhav**
* **GitHub**: [@PrernaJadhav1414](https://github.com/PrernaJadhav1414)
* **Live App**: [WanderLust on Render](https://wanderlust-0xxd.onrender.com/listings)

---
*Thank you for visiting WanderLust! Star ⭐ this repository if you found it helpful.*
