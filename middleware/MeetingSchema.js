var mongoose = require("mongoose");

var user = new mongoose.Schema({
  Users: [
    {
      status: {
        type: String,
      },
      type: {
        type: String,
      },
      userName: {
        type: String,
      },
      date: {
        type: String,
      },
      tokens: [],
    },
  ],
  Date: {
    type: String,
  },
  created_at: { type: Date, default: Date.now },
});
mongoose.models = {};

var User = mongoose.model("meeting", user);

module.exports = User;
