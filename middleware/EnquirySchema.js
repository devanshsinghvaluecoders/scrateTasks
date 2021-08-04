var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  
});

mongoose.models = {};

var User = mongoose.model("Enquiry", user);
module.exports = User;
