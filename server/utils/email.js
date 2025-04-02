const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'http://localhost:3000'}/reset-password/${token}`;

  const message = {
    from: `"Blog Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>You have requested to reset your password</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #0FA4AF;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin: 16px 0;
      ">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 10 minutes.</p>
    `
  };

  await transporter.sendMail(message);
}; 