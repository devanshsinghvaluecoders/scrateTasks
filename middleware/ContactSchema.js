var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var user = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

var User = mongoose.model("Messages", user);
module.exports = User;
