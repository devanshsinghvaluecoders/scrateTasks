var mongoose = require("mongoose");

var user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: {
    type: String,
    required: true,
  },
  pdfs: {
    type: String,
    required: true,
  },
  onWards: {
    type: Boolean,
    default: false,
  },
  unit: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  Beds: {
    type: String,
  },
  Baths: {
    type: String,
  },
  sqft: {
    type: Number,
  },
  tags: [
    {
      type: String,
    },
  ],
  created_at: { type: Date, default: Date.now },
});
mongoose.models = {};

var User = mongoose.model("Sites", user);

module.exports = User;
