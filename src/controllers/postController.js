const Post = require("../models/Post");

// Lấy tất cả bài viết
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Tạo bài viết mới
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageResult = await cloudinary.uploader.upload(req.file.path);
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    const post = new Post({ title, content, imageUrl: imageResult.secure_url });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật bài viết
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Xóa bài viết
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy bài viết theo ID (thêm hàm này)
const getPostById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const post = await Post.findById(id); // Tìm bài viết trong MongoDB
    if (!post) {
      return res.status(404).json({ message: "Post not found" }); // Nếu không tìm thấy
    }
    res.json(post); // Trả về bài viết
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPosts, createPost, updatePost, deletePost, getPostById };
