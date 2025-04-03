const User = require("../models/User");
const sendNotificationEmail = require("./sendNotificationEmail");
const { io } = require("../server");

const createNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const newNotification = {
      ...notification,
      createdAt: new Date(),
      read: false,
    };

    user.notifications.unshift(newNotification);
    await user.save();

    // Send real-time notification
    io.to(userId).emit("notification", newNotification);

    // Send email if user has enabled relevant notification
    if (user.emailPreferences[getEmailPreferenceKey(notification.type)]) {
      await sendNotificationEmail(
        user.email,
        getNotificationEmailSubject(notification.type),
        notification.text
      );
    }

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

const getEmailPreferenceKey = (type) => {
  const preferenceMap = {
    follow: "newFollower",
    like: "blogLiked",
    comment: "newComment",
    mention: "newComment",
  };
  return preferenceMap[type] || "blogLiked";
};

const getNotificationEmailSubject = (type) => {
  const subjectMap = {
    follow: "New Follower on BlogVerse",
    like: "Someone liked your post",
    comment: "New comment on your post",
    mention: "You were mentioned in a comment",
  };
  return subjectMap[type] || "New notification from BlogVerse";
};

module.exports = {
  createNotification,
};
