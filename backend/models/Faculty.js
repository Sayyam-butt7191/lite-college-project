const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  phone: { type: String, default: '' },
  image: { type: String, required: true }
});

module.exports = mongoose.model('Faculty', facultySchema);