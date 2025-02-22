const express = require("express");
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", getPosts); // Get all posts
router.post("/", createPost); // Create a post
router.put("/:id", updatePost); // Update a post
router.delete("/:id", deletePost); // Delete a post
router.get("/:id", getPostById); // Get a post

module.exports = router;
