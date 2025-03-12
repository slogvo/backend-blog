// src/controllers/notionController.js
// const NotionService = require('../services/notionService');
// const { notion, cache, databaseIds } = require('../config/notion');
const container = require('../container');

// const notionService = new NotionService({ notion, cache, databaseIds });

const getPosts = async (req, res, next) => {
  try {
    const result = await container.notionService.getPosts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await container.notionService.getPostBySlug(slug);
    res.json(post);
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

const searchPosts = async (req, res, next) => {
  try {
    const result = await container.notionService.searchPosts(req.query);
    res.json(result);
  } catch (error) {
    if (error.message === 'Search query is required') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const globalSearch = async (req, res, next) => {
  try {
    const { query, pageSize, startCursor } = req.query;
    const result = await container.notionService.globalSearch({
      query,
      pageSize,
      startCursor,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAuthors = async (req, res, next) => {
  try {
    const authors = await container.notionService.getAuthors();
    res.json(authors);
  } catch (error) {
    next(error);
  }
};

const getAuthorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = await container.notionService.getAuthorById(id);
    res.json(author);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await container.notionService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await container.notionService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  searchPosts,
  globalSearch,
  getAuthors,
  getAuthorById,
  getCategories,
  getSettings,
};
