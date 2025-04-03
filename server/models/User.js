const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        blog: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog",
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ["follow", "like", "comment", "mention"],
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        blog: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog",
        },
        text: String,
        read: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    emailPreferences: {
      newFollower: { type: Boolean, default: true },
      newComment: { type: Boolean, default: true },
      blogLiked: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return next();
  }
  try {
    console.log("Hashing password for user:", this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords for user:", this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Password comparison error:", error);
    throw new Error("Password comparison failed");
  }
};

// Generate password reset token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema); // Ensure 'User' is the correct model name
