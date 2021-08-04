var mongoose = require("mongoose");

var user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  images: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: { type: Date, required: true, default: Date.now },
});

var User = mongoose.model("Blogs", user);

module.exports = User;
