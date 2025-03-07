// src/config/notion.js
const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');

// const getNotionClient = () => {
//   const notion = new Client({
//     auth: process.env.NOTION_API_KEY,
//   });
//   console.log('Notion initialized with token:', process.env.NOTION_API_KEY); // Debug
//   return notion;
// };

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
console.log('Notion initialized with token:', process.env.NOTION_API_KEY); // Debug

const cache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 3600,
  checkperiod: 120,
});

module.exports = {
  // getNotionClient,
  notion,
  cache,
  databaseIds: {
    posts: process.env.NOTION_POSTS_DATABASE_ID,
  },
};
