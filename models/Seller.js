const mongoose = require("mongoose");

const sellerschema = new mongoose.Schema({
  sellerid: {
    type: Number,
    unique: true,
    required: true,
    default: () => generateRandomId(),
  },
  username: {
    type: String,
    required: true,
  },
  companyname: {
    type: String,
    required: true,
    unique: true,
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
});

const seller = mongoose.model("Seller", sellerschema);

function generateRandomId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

module.exports = seller;
