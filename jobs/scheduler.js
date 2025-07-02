const cron = require("node-cron");
const User = require("../models/User");
const Product = require("../models/Product");
const { sendNotification } = require("../utils/oneSignal");

let lastType = "discount";

cron.schedule("0 * * * *", async () => {
  try {
    const users = await User.find({}).lean();
    const deals = await Product.find({ saleType: { $ne: "Regular" } }).lean();

    for (let user of users) {
      let product = null, image = "", deepLink = "", message = "";
      const heading = `Hey ${user.username}`;

      if (lastType === "discount") {
        const recentId = user.recentProducts?.[0];
        product = recentId
          ? await Product.findOne({ productId: recentId }).lean()
          : await Product.findOne({}).lean(); // fallback

        if (product) {
          image = product.productImages?.[0];
          deepLink = `/view-product/${product.productId}`;
          message = `Still interested in ${product.productName}? Tap to revisit.`;
        }
      } else {
        const deal = deals[Math.floor(Math.random() * deals.length)];
        if (deal) {
          product = deal;
          image = deal.productImages?.[0];
          deepLink = `/view-product/${deal.productId}`;
          message = `${deal.productName} is now ₹${deal.priceDiscount}. Don't miss it!`;
        }
      }

      if (image && message) {
        await sendNotification({ userId: user.userid, heading, message, image, deepLink });
      }
    }

    lastType = lastType === "discount" ? "recent" : "discount";
  } catch (err) {
    console.error("Notification Cron Error:", err.message);
  }
});
