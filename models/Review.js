const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewid: {
      type: Number,
      unique: true,
      required: true,
      default: () => generateRandomId(),
    },
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    }, // Add user ID field
    productid: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

function generateRandomId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

module.exports = mongoose.model("Review", reviewSchema);
