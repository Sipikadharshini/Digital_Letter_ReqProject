const nodemailer = require('nodemailer');

// Configure to use a real email service like Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.SMTP_USER, // Your real email address (e.g., yourname@gmail.com)
    pass: process.env.SMTP_PASS  // Your App Password (NOT your regular account password)
  }
});

exports.sendEmail = async (to, subject, text) => {
  try {
    console.log(`[EMAIL SENDING] To: ${to} | Subject: ${subject}`);
    await transporter.sendMail({
      from: `"DocFlow System" <${process.env.SMTP_USER}>`,
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
