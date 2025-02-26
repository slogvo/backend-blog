const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostById,
  getAuthors,
  getAuthorById,
  getCategories,
  getSettings,
} = require("../controllers/notionController");

// Posts routes
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);

// Authors routes
router.get("/authors", getAuthors);
router.get("/authors/:id", getAuthorById);

// Categories routes
router.get("/categories", getCategories);

// Settings route
router.get("/settings", getSettings);

module.exports = router;
