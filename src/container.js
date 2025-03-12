// src/container.js
const { notion, cache, databaseIds } = require('./config/notion');
const NotionService = require('./services/notionService');

const container = {
  notion,
  cache,
  databaseIds,
  notionService: new NotionService({ notion, cache, databaseIds }),
};

module.exports = container;
