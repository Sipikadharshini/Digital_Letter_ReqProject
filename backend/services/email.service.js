const nodemailer = require('nodemailer');

const smtpPort = Number(process.env.SMTP_PORT || 587);

// Configure SMTP explicitly so deployment uses the same host/port as .env.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER, // Your real email address (e.g., yourname@gmail.com)
    pass: process.env.SMTP_PASS  // Your App Password (NOT your regular account password)
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
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
