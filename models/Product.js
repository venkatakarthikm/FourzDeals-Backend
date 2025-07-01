const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    productDetails: {
        type: String,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true // Original price before discount
    },
    priceDiscount: {
        type: Number,
        default: 0 // Discounted amount on original price
    },
    discountValidUntil: {
        type: Date, // The date until the discount is valid
        default: null
    },
    productDescription: {
        type: String,
        required: true
    },
    productImages: [String],  // Store image file paths here
    productTags: [String],
    category: {
        type: String, // Example: "Electronics", "Mobiles", etc.
        required: true
    },
    saleType: {
        type: String, // Example: "Regular", "Sale", "Limited Edition", etc.
        default: "Regular"
    },
    stock:{
        type:Number,
        required: true
    },
    productOwner: {
        type: String, // Name or identifier of the product owner
        required: true
    },
    companyName: {
        type: String, // Name of the company manufacturing the product
        required: true
    }
}, { timestamps: true });

// Pre-save middleware to check if the discount time is expired
productSchema.pre('save', function (next) {
    const currentDate = new Date();

    // Check if discountValidUntil has passed
    if (this.discountValidUntil && this.discountValidUntil < currentDate) {
        // If the discount time is expired, set saleType to 'Regular' and reset discount
        this.saleType = 'Regular';
        this.priceDiscount = 0;
    }

    next();
});

module.exports = mongoose.model('Product', productSchema);
