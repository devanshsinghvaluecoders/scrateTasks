var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  status: {
    type: Boolean,
    default: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

const User = mongoose.model("Logins", userSchema);
module.exports = User;
