// src/index.js
require('dotenv').config();

console.log('Checking environment variables after dotenv:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('RECEIVER_EMAIL:', process.env.RECEIVER_EMAIL);

if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.RECEIVER_EMAIL
) {
  console.error('Error: Missing critical environment variables. Exiting...');
  process.exit(1);
}

const express = require('express');
const { initServer } = require('./server');
const { setupCron } = require('./utils/cron');

const app = express();

const startServer = async () => {
  try {
    await initServer(app);
    setupCron();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
