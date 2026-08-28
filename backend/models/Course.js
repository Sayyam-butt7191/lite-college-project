const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  badge: { type: String, default: '' }, // Best Seller, Trending, Creative
  image: { type: String, required: true }
});

module.exports = mongoose.model('Course', courseSchema);