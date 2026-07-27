const Listing = require("../models/listing");
const axios = require("axios");
const { cloudinary } = require("../cloudConfig.js");

// Helper to delete image from Cloudinary storage
async function deleteCloudinaryImage(filename) {
  if (filename && typeof filename === "string" && !filename.startsWith("http")) {
    try {
      await cloudinary.uploader.destroy(filename);
      console.log("🗑️ Deleted Cloudinary asset:", filename);
    } catch (err) {
      console.error("Cloudinary deletion error:", err.message);
    }
  }
}

// Free Nominatim (OpenStreetMap) geocoding - no API key required
async function forwardGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "WanderLust-App/1.0" },
  });
  const data = response.data;
  if (!data || data.length === 0) {
    return { features: [] };
  }
  return {
    features: [{
      geometry: {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
      },
    }],
  };
}

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await forwardGeocode(req.body.listing.location);

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  newListing.geometry = response.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you trying to edit for does not exist!");
    res.redirect("/listings");
  }
  imageUrl = listing.image.url;
  imageUrl = imageUrl.replace("/upload", "/upload/w_250,h_160");
  res.render("listings/edit.ejs", { listing, imageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;
  let response = await forwardGeocode(`${req.body.listing.location}, ${req.body.listing.country}`);

  req.body.listing.geometry = response.features[0].geometry;
  let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (typeof req.file !== "undefined") {
    // Delete old Cloudinary image if replacing
    if (updatedListing.image && updatedListing.image.filename) {
      await deleteCloudinaryImage(updatedListing.image.filename);
    }

    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.filter = async (req, res, next) => {
  let { id } = req.params;
  const safeIdPattern = id.replace(/[-/]/g, "[-/ ]");
  const categoryRegex = new RegExp(`^${safeIdPattern}$`, "i");

  let allListings = await Listing.find({
    $or: [
      { category: id },
      { category: { $regex: categoryRegex } },
    ],
  });

  const formattedName = id.replace(/-/g, " ");
  if (allListings.length != 0) {
    res.locals.success = `Listings Filtered by ${formattedName}!`;
    res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `There is no any Listing for ${formattedName}!`);
    res.redirect("/listings");
  }
};

module.exports.search = async (req, res) => {
  let input = req.query.q ? req.query.q.trim().replace(/\s+/g, " ") : "";

  if (input === "" || !input) {
    req.flash("error", "Please enter search query!");
    return res.redirect("/listings");
  }
  let data = input.split("");
  let element = "";
  let flag = false;
  for (let index = 0; index < data.length; index++) {
    if (index == 0 || flag) {
      element = element + data[index].toUpperCase();
    } else {
      element = element + data[index].toLowerCase();
    }
    flag = data[index] == " ";
  }

  let allListings = await Listing.find({
    title: { $regex: element, $options: "i" },
  });
  if (allListings.length != 0) {
    res.locals.success = "Listings searched by Title!";
    res.render("listings/index.ejs", { allListings });
    return;
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Category!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }
  if (allListings.length == 0) {
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Country!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Location!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }

  const intValue = parseInt(element, 10);
  const intDec = Number.isInteger(intValue);

  if (allListings.length == 0 && intDec) {
    allListings = await Listing.find({ price: { $lte: element } }).sort({
      price: 1,
    });
    if (allListings.length != 0) {
      res.locals.success = `Listings searched by price less than Rs ${element}!`;
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }
  if (allListings.length == 0) {
    req.flash("error", "No listings found based on your search!");
    res.redirect("/listings");
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);

  if (deletedListing && deletedListing.image && deletedListing.image.filename) {
    await deleteCloudinaryImage(deletedListing.image.filename);
  }

  console.log(deletedListing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

module.exports.reserveListing = async (req, res) => {
  let { id } = req.params;
  req.flash("success", "Reservation Details sent to your Email!");
  res.redirect(`/listings/${id}`);
};
