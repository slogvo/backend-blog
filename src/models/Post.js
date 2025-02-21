const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  // content: { type: Object, required: true },
  imageUrl: { type: String }, // Thêm trường này
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
