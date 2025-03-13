// src/controllers/emailController.js
const nodemailer = require('nodemailer');

const sendEmail = async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Debug environment variables in response
  const envDebug = {
    EMAIL_USER: process.env.EMAIL_USER || 'undefined',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'defined (hidden)' : 'undefined', // Hidden a Passwork
    RECEIVER_EMAIL: process.env.RECEIVER_EMAIL || 'undefined',
  };
  console.log('Environment debug:', envDebug);

  // Check up environment variables
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.RECEIVER_EMAIL
  ) {
    return res.status(500).json({
      error: 'Missing environment variables',
      debug: envDebug,
    });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'volonglqd@gmail.com',
      pass: 'syzdublbqgnalsiq',
    },
    logger: true,
    debug: true,
  });

  const mailOptions = {
    from: email, // volonglqd@gmail.com
    to: 'volonglqd@gmail.com', // volonglqd@gmail.com
    subject: `[Form Liên Hệ] Tin nhắn từ ${name} <${email}>`,
    html: `
      <h3>Tin nhắn từ form liên hệ</h3>
      <p><strong>Người gửi:</strong> ${name} <${email}></p>
      <p><strong>Lời nhắn:</strong> ${message}</p>
      <p><em>Đây là email tự động từ form liên hệ. Vui lòng trả lời trực tiếp đến địa chỉ trên để phản hồi.</em></p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({
      message: 'Email sent successfully',
      debug: envDebug,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Error sending email',
      message: error.message,
      debug: envDebug,
    });
    next(error);
  }
};

module.exports = { sendEmail };
