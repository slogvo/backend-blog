const express = require('express');
const router = express.Router();

const {
  getPosts,
  getPostBySlug,
  getAuthors,
  getAuthorById,
  searchPosts,
  globalSearch,
  getCategories,
  getSettings,
} = require('../controllers/notionController');

// Define asyncHandler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Middleware logging
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRequest);

// API versioning: /api/v1/...
const v1Router = express.Router();
// router.use('/v1', v1Router);
router.use(v1Router);

/**
 * @route GET /api/v1/posts
 * @desc Get all posts from Notion
 * @access Public
 */
v1Router.get('/posts', getPosts);

/**
 * @route GET /api/v1/posts/:slug
 * @desc Get a single post by slug
 * @access Public
 */
v1Router.get('/posts/:slug', getPostBySlug);

/**
 * @route GET /api/v1/search
 * @desc Get search post. GET /api/v1/search?query=javascript&page=1&pageSize=10&category=tech
 * @access Public
 */

v1Router.get('/search', asyncHandler(searchPosts));

v1Router.get('/global-search', asyncHandler(globalSearch));
/**
 * @route GET /api/v1/authors
 * @desc Get all authors from Notion
 * @access Public
 */
v1Router.get('/authors', getAuthors);

/**
 * @route GET /api/v1/authors/:id
 * @desc Get a single author by ID
 * @access Public
 */
v1Router.get('/authors/:id', getAuthorById);

/**
 * @route GET /api/v1/categories
 * @desc Get all categories from Notion
 * @access Public
 */
v1Router.get('/categories', getCategories);

/**
 * @route GET /api/v1/settings
 * @desc Get settings from Notion
 * @access Public
 */
v1Router.get('/settings', getSettings);

module.exports = router;
