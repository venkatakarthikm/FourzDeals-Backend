const cartcontroller = require("../controllers/cartController");

const express = require("express");

const cartrouter = express.Router();

cartrouter.post("/cart/add", cartcontroller.addProductToCart);

cartrouter.delete("/:userId/product/:productId",  cartcontroller.deleteProductFromCart);

cartrouter.get("/cart/:userId", cartcontroller.getCartItems);

module.exports = cartrouter;