const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  userid: {
    type: Number,
    unique: true,
    required: true,
    default: () => generateRandomId(),
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
   image: {
    type: String,
    default: "",
  },
  recentProducts: {
  type: [String],
  default: [],
  },
  searchHistory: {
  type: [String],
  default: [],
  },

});

const user = mongoose.model("User", userschema);

function generateRandomId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

module.exports = user;
