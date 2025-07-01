const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require('node-cron'); // Import node-cron
require('dotenv').config();
const path = require("path");

const dburl = process.env.mongodburl;
mongoose.connect(dburl).then(() => {
    console.log("Connected to DB Successfully");
}).catch((err) => {
    console.log(err.message);
});

const app = express();
app.use(express.json());
app.use(cors());

const userrouter = require("./routes/userroutes");
const productrouter = require("./routes/productroutes");
const cartrouter = require("./routes/cartroutes");
const orderroutes = require("./routes/orderRouter");
const sellerroutes = require("./routes/sellerroutes");
const reviewroutes = require("./routes/reviewroutes");

app.use("", userrouter);
app.use("", productrouter);
app.use("",cartrouter)
app.use("", orderroutes);
app.use("", sellerroutes);
app.use("", reviewroutes);
app.use("/images", express.static(path.join(__dirname, 'images')));

const Product = require('./models/Product');

app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}, 'productId'); // get only _id
    const urls = products.map(p =>
      `<url><loc>https://fourzdeals.com/viewproduct/${p.productId}</loc></url>`
    );
    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://fourzdeals.com/</loc></url>
  <url><loc>https://fourzdeals.com/login</loc></url>
  <url><loc>https://fourzdeals.com/products</loc></url>
  ${urls.join('\n')}
</urlset>`);
  } catch (err) {
    console.error("Failed to generate sitemap:", err.message);
    res.status(500).send("Error generating sitemap");
  }
});

// POST /products/check-stock
app.post('/products/check-stock', async (req, res) => {
  const { products } = req.body;

  try {
    for (let item of products) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product || product.stock < item.quantity) {
        return res.json({ success: false, message: `Insufficient stock for ${item.productId}` });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error while checking stock." });
  }
});

app.get('/is-active', (req, res) => {
  res.status(200).send('Server is live');
});

// Cron job: Update expired discounts at midnight every day
// Cron job: Update expired discounts every minute
cron.schedule('*/1 * * * *', async () => {
  try {
    const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const expired = await Product.find({
      discountValidUntil: { $lt: istDate },
      saleType: { $ne: 'Regular' },
    }).maxTimeMS(5000); // <-- add this to limit timeout risk

    for (const p of expired) {
      p.saleType = 'Regular';
      p.priceDiscount = 0;
      await p.save();
    }

    console.log(`Expired products updated at ${istDate}`);
  } catch (err) {
    console.error("Error updating expired discounts:", err.message);
  }
});

const port = process.env.PORT || 4444;   //if env file is not there or will be taken
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
