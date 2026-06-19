const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmail({ to, subject, html, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: `"FleetOS - LEC Fleet Management" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: attachments || [],
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };