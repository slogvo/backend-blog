const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  // content: { type: Object, required: true },
  author: {
    ref: "User",
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
