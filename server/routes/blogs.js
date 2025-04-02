const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const auth = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose"); // Added mongoose for aggregation

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

// @route   GET api/blogs/stats
// @desc    Get blog statistics
// @access  Public
router.get("/stats", async (req, res) => {
  try {
    const [viewStats, commentStats, categoryStats] = await Promise.all([
      Blog.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Blog.aggregate([
        { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ]),
      Blog.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count", _id: 0 } },
      ]),
    ]);

    // Calculate view trends for the last 6 months
    const viewTrendData = await Blog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          views: { $sum: "$views" },
          prevViews: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    { $subtract: [new Date(), "$createdAt"] },
                    30 * 24 * 60 * 60 * 1000,
                  ],
                },
                "$views",
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
      {
        $project: {
          name: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          views: 1,
          trend: {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$prevViews", 0] },
                  0,
                  {
                    $divide: [
                      { $subtract: ["$views", "$prevViews"] },
                      "$prevViews",
                    ],
                  },
                ],
              },
              100,
            ],
          },
        },
      },
    ]);

    // Calculate average read time (assuming 200 words per minute reading speed)
    const averageReadTime = await Blog.aggregate([
      {
        $addFields: {
          wordCount: {
            $size: { $split: ["$content", " "] },
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $divide: ["$wordCount", 200],
            },
          },
        },
      },
    ]);

    // Calculate engagement rate (comments + views) / total posts
    const totalPosts = await Blog.countDocuments();
    const engagementRate =
      totalPosts > 0
        ? ((viewStats[0]?.total || 0) + (commentStats[0]?.total || 0)) /
          totalPosts
        : 0;

    res.json({
      totalViews: viewStats[0]?.total || 0,
      totalComments: commentStats[0]?.total || 0,
      averageReadTime: Math.round(averageReadTime[0]?.avgTime || 0),
      engagementRate: Number(engagementRate.toFixed(2)),
      categoryCounts: categoryStats,
      viewTrend: viewTrendData,
    });
  } catch (err) {
    console.error("Error fetching blog statistics:", err);
    res.status(500).json({ message: "Failed to fetch blog statistics" });
  }
});

// @route   GET api/blogs/category/:category
// @desc    Get blogs by category
// @access  Public
router.get("/category/:category", async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    console.log("Searching for category:", category);

    // Use case-insensitive regex match for category
    const blogs = await Blog.find({
      category: { $regex: new RegExp("^" + category + "$", "i") },
    })
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .select("title content category coverImage createdAt user");

    console.log(`Found ${blogs.length} posts for category ${category}`);
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
    const blogData = await Blog.findById(req.params.id).populate(
      "user",
      "name"
    );

    if (!blogData) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // Ensure HTTPS for cover image
    if (blogData.coverImage) {
      const isValidImage = await cloudinary.validateImageUrl(
        blogData.coverImage
      );
      if (!isValidImage) {
        blogData.coverImage = null; // Clear invalid image URL
      } else {
        blogData.coverImage = blogData.coverImage.replace(
          "http://",
          "https://"
        );

        // Add Cloudinary optimization parameters for blog cover images
        if (blogData.coverImage.includes("cloudinary.com")) {
          const imageUrl = new URL(blogData.coverImage);
          const transformationString = "/c_fill,w_1200,h_630,q_auto,f_auto";
          const pathParts = imageUrl.pathname.split("/");
          const uploadIndex = pathParts.indexOf("upload");
          if (uploadIndex !== -1) {
            pathParts.splice(uploadIndex + 1, 0, transformationString);
            imageUrl.pathname = pathParts.join("/");
            blogData.coverImage = imageUrl.toString();
          }
        }
      }
    }

    res.json(blogData);
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
    const { title, content, category, coverImage, isDraft } = req.body;

    const newBlog = new Blog({
      title,
      content,
      category,
      coverImage,
      isDraft: isDraft || false, // Default to false if not provided
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
      const isValidImage = await cloudinary.validateImageUrl(coverImage);
      if (!isValidImage) {
        return res.status(400).json({ msg: "Invalid image URL provided" });
      }

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
