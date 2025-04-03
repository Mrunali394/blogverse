const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendNotificationEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"BlogVerse" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`Notification email sent to ${to}`);
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
};

module.exports = sendNotificationEmail;
