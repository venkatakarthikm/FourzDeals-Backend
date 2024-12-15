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

app.use("", userrouter);
app.use("", productrouter);
app.use("",cartrouter)
app.use("", orderroutes);
app.use("", sellerroutes);
app.use("/images", express.static(path.join(__dirname, 'images')));

const Product = require('./models/Product');

// Cron job: Update expired discounts at midnight every day
// Cron job: Update expired discounts every minute
cron.schedule('*/1 * * * *', async () => {
    // Convert current time to IST
    const currentDate = new Date();
    const istDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);

    try {
        console.log('IST Time:', istDate);

        // Find products with expired discounts
        const expiredProducts = await Product.find({
            discountValidUntil: { $lt: istDate },
            saleType: { $ne: 'Regular' }
        });

        console.log('Expired Products:', expiredProducts);

        // Update products to "Regular" and reset discount
        for (const product of expiredProducts) {
            product.saleType = 'Regular';
            product.priceDiscount = 0;
            const updatedProduct = await product.save();
            console.log('Updated Product:', updatedProduct);
        }

        console.log('Expired discounts updated successfully at', istDate);
    } catch (error) {
        console.error('Error updating expired discounts:', error);
    }
});



const port = process.env.PORT || 4444;   //if env file is not there or will be taken
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
