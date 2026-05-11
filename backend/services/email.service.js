const nodemailer = require('nodemailer');

// Use a test account or simply log if no credentials are provided
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

exports.sendEmail = async (to, subject, text) => {
  try {
    console.log(`[EMAIL SENDING] To: ${to} | Subject: ${subject}`);
    await transporter.sendMail({
      from: '"DocFlow System" <noreply@docflow.edu>',
      to,
      subject,
      text,
    });
    console.log(`[EMAIL SENT] Successfully dispatched to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
