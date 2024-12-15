// Backend Code: Updated multer and product handling

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Product = require("../models/Product");
const moment = require('moment-timezone');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { category, productId } = req.body;

    // Create dynamic folder structure
    const folderPath = path.join(
      __dirname,
      "../images",
      category.toLowerCase(),
      productId
    );

    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomUUID(); // Generate a unique identifier
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`); // Unique name for each file
  },
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).array("productImages", 10); // Accept up to 10 images

const insertProduct = async (request, response) => {
  upload(request, response, async (err) => {
    if (err) {
      return response
        .status(400)
        .json({ message: "Image upload failed", error: err.message });
    }

    try {
      const {
        productId,
        productName,
        originalPrice,
        priceDiscount,
        discountValidUntil,
        productDescription,
        productTags,
        category,
        saleType,
        customSaleName, // New field for custom sale names
        productOwner,    // Owner of the product
        companyName      // Company manufacturing the product
      } = request.body;

      const productImages = request.files.map((file) => {
        const folderPath = path.relative(
          path.join(__dirname, "../images"),
          file.path
        );
        return `/images/${folderPath.replace(/\\/g, "/")}`;
      });

      // Parse discountValidUntil in IST timezone
      const discountDate = discountValidUntil
        ? moment.tz(discountValidUntil, "Asia/Kolkata").toDate()
        : null;

      // Handle custom sale names
      const finalSaleType = saleType === "Other" ? customSaleName : saleType;

      if (saleType === "Other" && !customSaleName) {
        return response
          .status(400)
          .json({ message: "Custom sale name is required for 'Other' type." });
      }

      const newProduct = new Product({
        productId,
        productName,
        originalPrice,
        priceDiscount: saleType === "Regular" ? 0 : priceDiscount,
        discountValidUntil: saleType === "Regular" ? null : discountDate,
        productDescription,
        productImages,
        productTags: Array.isArray(productTags) ? productTags : [],
        category,
        saleType: finalSaleType,
        productOwner,    // Include product owner
        companyName      // Include company name
      });

      await newProduct.save();
      response
        .status(201)
        .json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
      response
        .status(500)
        .json({ message: "Failed to add product", error: error.message });
    }
  });
};

// Get product by productId
const getProductById = async (request, response) => {
  const { productId } = request.params;

  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return response.status(404).json({ message: "Product not found" });
    }

    response.json(product);
  } catch (error) {
    response
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

const getAllNonRegularProducts = async (req, res) => {
  try {
    // Query to fetch products where saleType is not 'Regular'
    const products = await Product.find({ saleType: { $ne: "Regular" } });
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get products by productOwner
const getProductsByOwner = async (req, res) => {
  const { productOwner } = req.params;

  try {
    const products = await Product.find({ productOwner });
    if (!products.length) {
      return res.status(404).json({ message: "No products found for this owner" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit product by productId
const editProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.productName = req.body.productName || product.productName;
    product.originalPrice = req.body.originalPrice || product.originalPrice;
    product.priceDiscount = req.body.priceDiscount || product.priceDiscount;
    product.discountValidUntil = req.body.discountValidUntil || product.discountValidUntil;
    product.productDescription = req.body.productDescription || product.productDescription;
    product.productTags = req.body.productTags || product.productTags;
    product.category = req.body.category || product.category;
    product.saleType = req.body.saleType || product.saleType;
    product.companyName = req.body.companyName || product.companyName;

    // If images were uploaded, update them
    if (req.files && req.files.length) {
      product.productImages = req.files.map((file) => {
        const folderPath = path.relative(path.join(__dirname, "../images"), file.path);
        return `/images/${folderPath.replace(/\\/g, "/")}`;
      });
    }

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    // Find the product by productId
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated image files
    product.productImages.forEach((imagePath) => {
      const imageFilePath = path.join(__dirname, "..", imagePath);
      if (fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath); // Delete image file
      }
    });

    // Delete the product folder
    const folderPath = path.join(__dirname, "../images", product.category.toLowerCase(), product.productId);
    if (fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath, { recursive: true }); // Delete the product folder
    }

    // Remove the product using deleteOne()
    await Product.deleteOne({ productId }); // Use the model to delete the product
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};



module.exports = {
  insertProduct,
  getProductById,
  getAllProducts,
  getAllNonRegularProducts,
  getProductsByOwner,
  editProduct,
  deleteProduct,
};
