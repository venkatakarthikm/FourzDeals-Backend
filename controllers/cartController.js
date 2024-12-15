// controllers/cartController.js

const Cart = require("../models/Cart");

// Add product to cart
const addProductToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
  
    try {
      // Find the cart for the user or create a new one if it doesn't exist
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        cart = new Cart({ userId, products: [] });
      }
  
      // Check if the product already exists in the cart
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId === productId
      );
  
      if (existingProductIndex > -1) {
        // If it exists, update the quantity
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // If not, add the new product
        cart.products.push({ productId, quantity });
      }
  
      await cart.save();
  
      res.status(200).json({ message: "Product added to cart successfully!" });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).json({ message: "Failed to add product to cart." });
    }
  };

// Delete product from cart
const deleteProductFromCart = async (req, res) => {
    const { userId, productId } = req.params; // Use req.params to get the values from the URL
  
    try {
      const cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      // Filter out the product to be deleted
      cart.products = cart.products.filter(
        (p) => p.productId !== productId // Compare directly since productId is a string
      );
  
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error deleting product from cart", error });
    }
  };
  

// Get cart items
const getCartItems = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
};

module.exports = {
  addProductToCart,
  deleteProductFromCart,
  getCartItems,
};
