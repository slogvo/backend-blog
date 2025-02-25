const Post = require("../models/Post");

// Get all posts
const getPosts = async (_req, res) => {
  try {
    // const { id, user } = req.query;
    // let query = {};

    // if (id) query._id = id;
    // if (user) query.author = user;

    const posts = await Post.find();
    // Populate the author field with the username of the author of each post.
    // const posts = await Post.find(query).populate("author", "username");
    // Lấy toàn bộ
    // const posts = await Post.find(query).populate("author");
    // Model.find(query).populate('path', 'field1 field2 field3');
    // path: Tên trường tham chiếu (ở đây là 'author').
    // field1 field2 field3: Các trường bạn muốn lấy từ collection được tham chiếu (User), cách nhau bằng dấu  cách.

    // Loại bỏ trường nhạy cảm (như password)
    // await Post.find(query).populate('author', '-password');

    // Nếu User có trường tham chiếu khác (như profile)
    // await Post.find(query).populate({
    //   path: 'author',
    //   select: 'username email',
    //   populate: { path: 'profile', select: 'bio' }
    // });

    // Thêm .limit(10) để chỉ lấy 10 bài viết: await Post.find(query).populate('author', 'username email').limit(10);

    // Ý nghĩa: "Điền" (populate) dữ liệu tham chiếu từ collection khác vào trường author của Post.
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const imageResult = await cloudinary.uploader.upload(req.file.path);
    if (!title || !content || !author) {
      return res
        .status(400)
        .json({ message: "Title and content and author are required'" });
    }
    const post = new Post({
      title,
      content,
      author,
      imageUrl: imageResult.secure_url,
    });
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
