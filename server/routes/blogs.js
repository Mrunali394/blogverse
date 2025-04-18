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
    const blog = await Blog.findById(req.params.id)
      .populate("user", "name profilePicture")
      .populate({
        path: "comments.user",
        select: "name profilePicture",
      })
      .populate({
        path: "comments.replies.user", // Add this population for replies
        select: "name profilePicture",
      });

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // Ensure HTTPS for cover image
    if (blog.coverImage) {
      const isValidImage = await cloudinary.validateImageUrl(blog.coverImage);
      if (!isValidImage) {
        blog.coverImage = null; // Clear invalid image URL
      } else {
        blog.coverImage = blog.coverImage.replace("http://", "https://");

        // Add Cloudinary optimization parameters for blog cover images
        if (blog.coverImage.includes("cloudinary.com")) {
          const imageUrl = new URL(blog.coverImage);
          const transformationString = "/c_fill,w_1200,h_630,q_auto,f_auto";
          const pathParts = imageUrl.pathname.split("/");
          const uploadIndex = pathParts.indexOf("upload");
          if (uploadIndex !== -1) {
            pathParts.splice(uploadIndex + 1, 0, transformationString);
            imageUrl.pathname = pathParts.join("/");
            blog.coverImage = imageUrl.toString();
          }
        }
      }
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

// @route   GET api/blogs/drafts
// @desc    Get user's draft posts
// @access  Private
router.get("/drafts", auth, async (req, res) => {
  try {
    const drafts = await Blog.find({
      user: req.user.id,
      status: "draft",
    })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.json(drafts);
  } catch (err) {
    console.error("Error fetching drafts:", err);
    res.status(500).json({ message: "Failed to fetch drafts" });
  }
});

// @route   POST api/blogs
// @desc    Create a blog
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, category, coverImage, isDraft } = req.body;
    const MAX_CONTENT_LENGTH = 100000; // 100KB limit
    const MAX_TITLE_LENGTH = 200;

    // Debug logging
    console.log("Received blog creation request:", {
      titleLength: title?.length,
      contentLength: content?.length,
      category,
      isDraft,
      userId: req.user.id,
    });

    // Content length validation first
    if (content && content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({
        message: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`,
        currentLength: content.length,
        maxLength: MAX_CONTENT_LENGTH,
        code: "CONTENT_TOO_LONG",
      });
    }

    // Enhanced input validation
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (title.length < 5) {
      return res
        .status(400)
        .json({ message: "Title must be at least 5 characters long" });
    }

    if (title.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        message: `Title must be less than ${MAX_TITLE_LENGTH} characters`,
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (textContent.length < 50) {
      return res.status(400).json({
        message: "Content must be at least 50 characters long",
        currentLength: textContent.length,
      });
    }

    // Create and save blog with enhanced error handling
    try {
      const newBlog = new Blog({
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        coverImage: coverImage?.trim() || "",
        isDraft: Boolean(isDraft),
        status: Boolean(isDraft) ? "draft" : "published",
        publishedAt: Boolean(isDraft) ? null : new Date(),
        user: req.user.id,
      });

      const blog = await newBlog.save();
      const populatedBlog = await Blog.findById(blog._id).populate(
        "user",
        "name"
      );

      res.status(201).json(populatedBlog);
    } catch (saveError) {
      console.error("Blog save error:", saveError);
      return res.status(400).json({
        message: saveError.message || "Error saving blog to database",
        error: saveError.message,
        code: "SAVE_ERROR",
      });
    }
  } catch (err) {
    console.error("Blog creation error:", err);
    res.status(500).json({
      message: "Error creating blog post",
      error: err.message,
      code: "SERVER_ERROR",
    });
  }
});

// @route   PUT api/blogs/:id/publish
// @desc    Publish a draft post
// @access  Private
router.put("/:id/publish", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    blog.isDraft = false;
    blog.status = "published";
    blog.publishedAt = new Date();

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error("Error publishing draft:", err);
    res.status(500).json({ message: "Failed to publish draft" });
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

// @route   POST api/blogs/:id/like
router.post("/:id/like", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // Check if already liked
    const alreadyLiked = blog.likes.some(
      (like) => like.user.toString() === req.user.id
    );
    if (alreadyLiked) {
      blog.likes = blog.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
      blog.likesCount--;
    } else {
      blog.likes.push({ user: req.user.id });
      blog.likesCount++;
    }

    await blog.save();
    res.json({ likesCount: blog.likesCount, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   POST api/blogs/:id/comments
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const user = await User.findById(req.user.id).select("name profilePicture");

    const newComment = {
      text: req.body.text,
      user: req.user.id,
      name: user.name,
      profilePicture: user.profilePicture,
    };

    blog.comments.unshift(newComment);
    blog.commentsCount++;
    await blog.save();

    // Populate the user details for the new comment
    const populatedBlog = await Blog.findById(req.params.id).populate({
      path: "comments.user",
      select: "name profilePicture",
    });

    res.json(populatedBlog.comments);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   POST api/blogs/:id/comments/:commentId/replies
// @desc    Add reply to a comment
// @access  Private
router.post("/:id/comments/:commentId/replies", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Create the reply with minimal required fields
    const newReply = {
      user: req.user.id,
      text: req.body.text,
      date: new Date(),
    };

    comment.replies.unshift(newReply);
    await blog.save();

    // Fetch and populate the blog with all user details
    const populatedBlog = await Blog.findById(req.params.id)
      .populate("user", "name profilePicture")
      .populate("comments.user", "name profilePicture")
      .populate("comments.replies.user", "name profilePicture");

    // Return just the updated comments array
    res.json(populatedBlog.comments);
  } catch (err) {
    console.error("Error adding reply:", err);
    res.status(500).json({
      message: "Server Error while adding reply",
      error: err.message,
    });
  }
});

// @route   GET api/blogs/user/liked
// @desc    Get user's liked posts
// @access  Private
router.get("/user/liked", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({
      "likes.user": req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.json(blogs);
  } catch (err) {
    console.error("Error fetching liked posts:", err);
    res.status(500).json({ message: "Failed to fetch liked posts" });
  }
});

// @route   GET api/blogs/user/bookmarks
// @desc    Get user's bookmarked posts
// @access  Private
router.get("/user/bookmarks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "bookmarks.blog",
      populate: { path: "user", select: "name" },
    });

    const bookmarkedPosts = user.bookmarks.map((bookmark) => bookmark.blog);
    res.json(bookmarkedPosts);
  } catch (err) {
    console.error("Error fetching bookmarked posts:", err);
    res.status(500).json({ message: "Failed to fetch bookmarked posts" });
  }
});

// @route   GET api/blogs/user/posts
// @desc    Get logged in user's posts
// @access  Private
router.get("/user/posts", auth, async (req, res) => {
  try {
    const posts = await Blog.find({
      user: req.user.id,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});

// @route   GET api/blogs/user-liked
// @desc    Get user's liked posts
// @access  Private
router.get("/user-liked", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({
      "likes.user": req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.json(blogs);
  } catch (err) {
    console.error("Error fetching liked posts:", err);
    res.status(500).json({ message: "Failed to fetch liked posts" });
  }
});

// @route   GET api/blogs/user-bookmarked
// @desc    Get user's bookmarked posts
// @access  Private
router.get("/user-bookmarked", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "bookmarks.blog",
      populate: { path: "user", select: "name" },
    });

    const bookmarkedPosts = user.bookmarks.map((bookmark) => bookmark.blog);
    res.json(bookmarkedPosts);
  } catch (err) {
    console.error("Error fetching bookmarked posts:", err);
    res.status(500).json({ message: "Failed to fetch bookmarked posts" });
  }
});

// @route   GET api/blogs/dashboard/stats
// @desc    Get user's dashboard statistics
// @access  Private
router.get("/dashboard/stats", auth, async (req, res) => {
  try {
    const [user, blogs] = await Promise.all([
      User.findById(req.user.id),
      Blog.find({ user: req.user.id }),
    ]);

    const stats = {
      totalPosts: blogs.length,
      followers: user.followers.length,
      following: user.following.length,
      comments: blogs.reduce((acc, blog) => acc + blog.comments.length, 0),
      stats: {
        views: blogs.reduce((acc, blog) => acc + (blog.views || 0), 0),
        likes: blogs.reduce((acc, blog) => acc + (blog.likes.length || 0), 0),
        engagement: blogs.length
          ? blogs.reduce(
              (acc, blog) => acc + (blog.comments.length + blog.likes.length),
              0
            ) / blogs.length
          : 0,
      },
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
});

// @route   GET api/blogs/v1/search
// @desc    Search blogs with pagination
// @access  Public
router.get("/v1/search", async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.json({ blogs: [], total: 0 });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
      status: "published",
    };

    const [blogs, total] = await Promise.all([
      Blog.find(searchQuery)
        .sort({ createdAt: -1 })
        .populate("user", ["name", "profilePicture"])
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Blog.countDocuments(searchQuery),
    ]);

    res.json({
      blogs,
      total,
      hasMore: total > page * limit,
    });
  } catch (err) {
    console.error("Error searching blogs:", err);
    res.status(500).json({ message: "Failed to search blogs" });
  }
});

// @route   GET api/blogs/blog-search
// @desc    Search blogs
// @access  Public
router.get("/blog-search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
      status: "published", // Only search published blogs
    })
      .sort({ createdAt: -1 })
      .populate("user", "name profilePicture")
      .limit(10);

    res.json(blogs);
  } catch (err) {
    console.error("Error searching blogs:", err);
    res.status(500).json({ message: "Failed to search blogs" });
  }
});

// @route   GET api/blogs/feed
// @desc    Get posts from followed users
// @access  Private
router.get("/feed", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const blogs = await Blog.find({
      user: { $in: user.following },
      status: "published",
    })
      .sort({ createdAt: -1 })
      .populate("user", "name profilePicture");

    res.json(blogs);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/blogs/recommendations
// @desc    Get recommended posts based on followed users and interests
// @access  Private
router.get("/recommendations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const followedUsers = user.following;

    // Get posts from followed users and similar categories
    const blogs = await Blog.find({
      $or: [
        { user: { $in: followedUsers } },
        { category: { $in: user.interests } },
      ],
      status: "published",
      user: { $ne: req.user.id },
    })
      .sort({ createdAt: -1, likesCount: -1 })
      .limit(10)
      .populate("user", "name profilePicture");

    res.json(blogs);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
