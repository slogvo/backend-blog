// src/config/env.js
const dotenv = require('dotenv');

const loadEnv = () => {
  const result = dotenv.config();
  if (result.error) {
    console.error('Failed to load .env file:', result.error);
  } else {
    console.log('Environment variables loaded successfully');
  }

  // Debug giá trị
  console.log('NOTION_API_KEY:', process.env.NOTION_API_KEY);
  console.log('MONGO_URI:', process.env.MONGO_URI);
  console.log(
    'NOTION_POSTS_DATABASE_ID:',
    process.env.NOTION_POSTS_DATABASE_ID,
  );

  // Set default values
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || 3001;
};

module.exports = { loadEnv };
