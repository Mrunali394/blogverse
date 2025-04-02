const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog"); // Ensure this path and model name are correct

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// Get blog categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Blog.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

module.exports = router;
