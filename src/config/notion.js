// File: src/config/notion.js
const { Client } = require("@notionhq/client");
const NodeCache = require("node-cache");

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Initialize cache
const cache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 3600, // Default TTL: 1 hour
  checkperiod: 120,
});

module.exports = {
  notion,
  cache,
  databaseIds: {
    posts: process.env.NOTION_POSTS_DATABASE_ID,
  },
};
