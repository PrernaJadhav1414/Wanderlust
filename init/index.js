require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const User = require("../models/user.js");

const mongoUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongoUrl);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});

    let defaultUser = await User.findOne();
    if (!defaultUser) {
      defaultUser = new User({
        email: "admin@wanderlust.com",
        username: "WanderLust_Admin",
      });
      defaultUser = await User.register(defaultUser, "admin123");
    }

    const updatedData = initData.data.map((obj) => {
      // Clean up MongoDB Extended JSON format ($oid etc.)
      const cleaned = {
        title: obj.title,
        description: obj.description,
        image: obj.image,
        price: obj.price,
        location: obj.location,
        country: obj.country,
        category: obj.category,
        reviews: [], // skip old review refs (they don't exist in new DB)
        owner: defaultUser._id,
        geometry: obj.geometry || { type: "Point", coordinates: [0, 0] },
      };
      return cleaned;
    });

    await Listing.insertMany(updatedData);
    console.log(`✅ DB initialized with ${updatedData.length} listings!`);
  } catch (error) {
    console.error("Error initializing DB:", error);
  } finally {
    mongoose.connection.close();
  }
};

initDB();

