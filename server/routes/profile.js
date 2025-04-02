const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User"); // Ensure this path and model name are correct

// @route   GET /api/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put("/", auth, async (req, res) => {
  try {
    const { name, bio, location, website } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (bio) updateFields.bio = bio;
    if (location) updateFields.location = location;
    if (website) updateFields.website = website;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
