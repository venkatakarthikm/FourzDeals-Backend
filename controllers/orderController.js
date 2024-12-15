const Order = require("../models/Order");
const mongoose = require("mongoose");

// Add order after successful payment
const addOrder = async (req, res) => {
  const { userId, products, totalAmount, userData, paymentDetails } = req.body;

  try {
    // Ensure userId is a valid Number (if you're using Number for userId)
    if (typeof userId !== 'number') {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Validate that all payment details are provided
    if (!paymentDetails.paymentId || !paymentDetails.captureTime || !paymentDetails.amount) {
      return res.status(400).json({ message: "Payment details are incomplete." });
    }

    // Create a new order
    const newOrder = new Order({
      userId,  // Use userId as a number
      products: products.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        image: item.image,  // Add image URL
        seller: item.seller || "Unknown Seller",
      })),
      totalAmount,
      userData,
      paymentDetails: {
        paymentId: paymentDetails.paymentId,
        captureTime: paymentDetails.captureTime,
        amount: parseFloat(paymentDetails.amount),
      },
      createdAt: new Date(),
    });

    // Save the new order
    await newOrder.save();

    res.status(200).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order.", error });
  }
};

// Get all orders for a specific user
const getOrdersByUserId = async (req, res) => {
  const userId = Number(req.params.userId); // Convert userId to Number

  try {
    // Ensure the userId is valid
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Find all orders for the user
    const orders = await Order.find({ userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to retrieve orders.", error });
  }
};

const getOrdersBySeller = async (req, res) => {
  const { seller, range } = req.body; // Extract data from body

  const ranges = {
    today: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    last7days: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) },
    last30days: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
    last1year: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
  };

  const dateFilter = ranges[range] || {}; // Default to no filter

  try {
    const orders = await Order.aggregate([
      { $unwind: "$products" }, // Unwind products array
      { $match: { "products.seller": seller, createdAt: dateFilter } }, // Match seller and date range
      {
        $group: {
          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" }, // Total quantity sold per product
          totalSales: { $sum: "$totalAmount" }, // Total sales
        },
      },
    ]);

    if (orders.length === 0) {
      return res.status(404).json({ message: "No data found for this seller." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching seller data:", error);
    res.status(500).json({ message: "Failed to retrieve seller data.", error });
  }
};



module.exports = {
  addOrder,
  getOrdersByUserId,getOrdersBySeller,
};
