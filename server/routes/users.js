const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // Add this line
const User = require("../models/User"); // Ensure this path and model name are correct
const auth = require("../middleware/auth");
const Blog = require("../models/Blog"); // Ensure this path and model name are correct
const sendNotificationEmail = require("../utils/sendNotificationEmail"); // Corrected path

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/users/:id/follow
// @desc    Follow a user
router.post("/:id/follow", auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.following.includes(req.params.id);
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    // Send response with updated counts
    res.json({
      message: "User followed successfully",
      followers: userToFollow.followers.length,
      following: currentUser.following.length,
      isFollowing: true,
    });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post("/:id/unfollow", auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Remove from following/followers arrays
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    res.json({ msg: "User unfollowed successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name profilePicture bio")
      .select("followers");
    res.json(user.followers);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/users/:id/following
// @desc    Get users that a user is following
// @access  Public
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following", "name profilePicture bio")
      .select("following");
    res.json(user.following);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   POST api/users/bookmarks/:blogId
// @desc    Bookmark a blog
router.post("/bookmarks/:blogId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    const alreadyBookmarked = user.bookmarks.some(
      (bookmark) => bookmark.blog.toString() === req.params.blogId
    );

    if (alreadyBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (bookmark) => bookmark.blog.toString() !== req.params.blogId
      );
    } else {
      user.bookmarks.unshift({ blog: req.params.blogId });
    }

    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/users/notifications
// @desc    Get user notifications
router.get("/notifications", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("notifications")
      .populate("notifications.from", "name profilePicture")
      .populate("notifications.blog", "title");

    res.json(user.notifications);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put("/notifications/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    notification.read = true;
    await user.save();

    res.json(notification);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/users/dashboard/stats
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

// @route   GET api/users/dashboard/activity
// @desc    Get user's recent dashboard activity
// @access  Private
router.get("/dashboard/activity", auth, async (req, res) => {
  try {
    const activity = await Promise.all([
      Blog.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt"),
      Blog.find({ "likes.user": req.user.id })
        .sort({ "likes.createdAt": -1 })
        .limit(5)
        .select("title"),
      Blog.find({ "comments.user": req.user.id })
        .sort({ "comments.createdAt": -1 })
        .limit(5)
        .select("title"),
    ]);

    res.json(activity);
  } catch (err) {
    console.error("Error fetching dashboard activity:", err);
    res.status(500).json({ message: "Failed to fetch dashboard activity" });
  }
});

// @route   GET api/users/profile/:id
// @desc    Get user profile by ID with blog posts
// @access  Public
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find user
    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's published blogs with error handling
    let blogs = [];
    let postsCount = 0;

    try {
      [blogs, postsCount] = await Promise.all([
        Blog.find({ user: id, status: "published" })
          .sort({ createdAt: -1 })
          .select(
            "title content category coverImage createdAt likesCount commentsCount views"
          )
          .lean(),
        Blog.countDocuments({ user: id, status: "published" }),
      ]);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      blogs = [];
      postsCount = 0;
    }

    // Add follower status if authenticated request
    let isFollowing = false;
    if (req.user && user.followers) {
      isFollowing = user.followers.some(
        (followerId) => followerId.toString() === req.user.id
      );
    }

    // Calculate total views
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

    // Get top category
    const categories = blogs.map((blog) => blog.category).filter(Boolean);

    const topCategory =
      categories.length > 0
        ? [...new Set(categories)].sort(
            (a, b) =>
              categories.filter((v) => v === b).length -
              categories.filter((v) => v === a).length
          )[0]
        : "N/A";

    const userProfile = {
      _id: user._id,
      name: user.name || "",
      bio: user.bio || "",
      profilePicture: user.profilePicture || "",
      location: user.location || "",
      occupation: user.occupation || "",
      expertise: user.expertise || [],
      socialLinks: user.socialLinks || {},
      role: user.role || "user",
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      postsCount,
      blogs: blogs.map((blog) => ({
        ...blog,
        views: blog.views || 0,
        likesCount: blog.likesCount || 0,
        commentsCount: blog.commentsCount || 0,
      })),
      isFollowing,
      joinedDate: user.createdAt,
      totalViews,
      topCategory,
    };

    res.json(userProfile);
  } catch (err) {
    console.error("Error in profile/:id route:", err);
    res.status(500).json({
      message: "Server error while fetching profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// @route   GET api/users/search
// @desc    Search users
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ],
    })
      .select("name profilePicture bio followers")
      .limit(10);

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followersCount: user.followers.length,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Failed to search users" });
  }
});

// @route   GET api/users/user-search
// @desc    Search users
// @access  Public
router.get("/user-search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ],
    })
      .select("name profilePicture bio followers")
      .limit(10);

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followersCount: user.followers.length,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Failed to search users" });
  }
});

module.exports = router;
