const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
      return res.status(400).json({ msg: "Cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: "Already following" });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    // Create notification
    userToFollow.notifications.unshift({
      type: "follow",
      from: req.user.id,
      text: `${currentUser.name} started following you`,
    });

    await Promise.all([currentUser.save(), userToFollow.save()]);

    // Send email notification if enabled
    if (userToFollow.emailPreferences.newFollower) {
      await sendNotificationEmail(
        userToFollow.email,
        "New Follower",
        `${currentUser.name} started following you on BlogVerse!`
      );
    }

    res.json({ msg: "User followed successfully" });
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
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpire -notifications -emailPreferences"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's published blogs and count
    const [blogs, postsCount] = await Promise.all([
      Blog.find({ user: req.params.id, status: "published" })
        .sort({ createdAt: -1 })
        .select(
          "title content category coverImage createdAt likesCount commentsCount"
        ),
      Blog.countDocuments({ user: req.params.id, status: "published" }),
    ]);

    // Get follower status if authenticated request
    const isFollowing = req.user ? user.followers.includes(req.user.id) : false;

    const userProfile = {
      _id: user._id,
      name: user.name,
      bio: user.bio || "",
      profilePicture: user.profilePicture,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      postsCount,
      location: user.location,
      occupation: user.occupation,
      socialLinks: user.socialLinks,
      blogs: blogs,
      isFollowing,
      joinedDate: user.createdAt,
    };

    res.json(userProfile);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Failed to fetch user profile" });
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
