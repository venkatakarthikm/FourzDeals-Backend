const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: Number,  // Store as ObjectId
    required: true,
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
      },
      quantity: { type: Number, required: true },
      image: { type: String }, // Add image field
      seller: { type: String },
    },
  ],  
  totalAmount: { type: Number, required: true },
  userData: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  paymentDetails: {
    paymentId: { type: String, required: true },
    captureTime: { type: Date, required: true },
    amount: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
