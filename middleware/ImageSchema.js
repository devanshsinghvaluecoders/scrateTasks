var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var user = new Schema({
  img: {
    data: Buffer,
    contentType: String,
  },
});
mongoose.models = {};

var User = mongoose.model("Image", user);

module.exports = User;
