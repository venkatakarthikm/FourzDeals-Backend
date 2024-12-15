const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: Number, // Assuming userId is a number based on your provided user model
    required: true,
    unique: true,
  },
  products: [
    {
      productId: {
        type: String, // Assuming productId is a string based on your provided product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
