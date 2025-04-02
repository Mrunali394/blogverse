const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const auth = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");

// @route   GET api/blogs
// @desc    Get all blogs
// @access  Public
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .select("title content category coverImage createdAt user");
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching blogs:", err.message, err.stack); // Enhanced error logging
    res
      .status(500)
      .json({ message: "Failed to fetch blogs", error: err.message });
  }
});

// @route   GET api/blogs/categories
// @desc    Get all unique categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = await Blog.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/blogs/category/:category
// @desc    Get blogs by category
// @access  Public
router.get("/category/:category", async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const blogs = await Blog.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .select("title content category coverImage createdAt user");

    res.json(blogs);
  } catch (err) {
    console.error("Error fetching blogs by category:", err);
    res.status(500).json({
      message: "Server error while fetching category blogs",
      error: err.message,
    });
  }
});

// @route   GET api/blogs/:id
// @desc    Get blog by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/blogs
// @desc    Create a blog
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, category, coverImage } = req.body;

    let cloudinaryUrl = "";

    if (coverImage) {
      try {
        const uploadResult = await cloudinary.uploader.upload(coverImage, {
          folder: "blogverse/blog-covers",
          transformation: cloudinary.defaultTransformations.blog_card,
          secure: true, // Ensure HTTPS URL
        });
        cloudinaryUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(400).json({ msg: "Image upload failed" });
      }
    }

    const newBlog = new Blog({
      title,
      content,
      category,
      coverImage: cloudinaryUrl, // Use the secure URL
      user: req.user.id,
    });

    const blog = await newBlog.save();
    const populatedBlog = await Blog.findById(blog._id).populate(
      "user",
      "name"
    );
    res.json(populatedBlog);
  } catch (err) {
    console.error("Blog creation error:", err);
    res.status(500).json({
      message: "Error creating blog post",
      error: err.message,
    });
  }
});

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const { title, content, category, coverImage } = req.body;

    // Handle image update if new image is provided
    if (coverImage && coverImage !== blog.coverImage) {
      try {
        const uploadResult = await cloudinary.uploader.upload(coverImage, {
          folder: "blogverse/blog-covers",
          transformation: cloudinary.defaultTransformations.blog_card,
        });
        blog.coverImage = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
      }
    }

    blog.title = title;
    blog.content = content;
    blog.category = category;

    await blog.save();
    const updatedBlog = await Blog.findById(blog._id).populate("user", "name");
    res.json(updatedBlog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // Make sure user owns blog
    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await blog.remove();
    res.json({ msg: "Blog removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Blog not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   GET api/blogs/stats
// @desc    Get user's blog statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = {
      totalPosts: await Blog.countDocuments({ user: req.user.id }),
      followers: 0, // Implement based on your User model
      following: 0, // Implement based on your User model
      completedTasks: 0, // Implement if needed
    };

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/blogs/recent-activity
// @desc    Get user's recent activity
// @access  Private
router.get("/recent-activity", auth, async (req, res) => {
  try {
    const activities = await Blog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    const formattedActivities = activities.map((activity) => ({
      text: `Created post: ${activity.title}`,
      time: activity.createdAt,
    }));

    res.json(formattedActivities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
