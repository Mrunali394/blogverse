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

cloudinary.listResources = async (folder) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 500,
    });
    return result.resources;
  } catch (error) {
    console.error("Error fetching Cloudinary resources:", error);
    return [];
  }
};

cloudinary.validateImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    return response.ok && contentType?.startsWith("image/");
  } catch (error) {
    console.error("Error validating image URL:", error);
    return false;
  }
};

module.exports = cloudinary;
