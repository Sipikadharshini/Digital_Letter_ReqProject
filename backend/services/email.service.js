const nodemailer = require('nodemailer');

const smtpPort = Number(process.env.SMTP_PORT || 587);
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || `"DocFlow System" <${process.env.SMTP_USER}>`;

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

    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to,
          subject,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend email failed: ${response.status} ${errorText}`);
      }

      console.log(`[EMAIL SENT] Successfully dispatched to ${to}`);
      return true;
    }

    await transporter.sendMail({
      from: emailFrom,
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
