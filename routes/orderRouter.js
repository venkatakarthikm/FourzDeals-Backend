const express = require("express");
const orderController = require("../controllers/orderController");

const orderRouter = express.Router();

// Route to place a new order
orderRouter.post("/orders/add", orderController.addOrder);

// Route to retrieve orders by userId
orderRouter.get("/orders/:userId", orderController.getOrdersByUserId);

orderRouter.post("/orders/seller", orderController.getOrdersBySeller);

module.exports = orderRouter;
 