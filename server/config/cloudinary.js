const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.defaultTransformations = {
  blog_card: [
    { width: 400, height: 250, crop: "fill" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  blog_cover: [
    { width: 1200, height: 630, crop: "fill" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
};

module.exports = cloudinary;
