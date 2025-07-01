// Backend Code: Updated multer and product handling
const path = require("path");
const multer = require("multer");
const FormData = require("form-data");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Product = require("../models/Product");
const moment = require('moment-timezone');
// Configure multer storage
const upload = multer({ storage: multer.memoryStorage() }).array("productImages", 10);

const insertProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: "Image upload failed", error: err.message });

    try {
      const {
        productId, productName, productDetails, originalPrice, priceDiscount,
        discountValidUntil, productDescription, productTags,
        category, saleType, customSaleName,stock, productOwner, companyName
      } = req.body;

      // Basic validation
      if (!productId || !productName|| !productDetails || !originalPrice || !productDescription ||!stock || !productOwner || !companyName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Upload each image to FreeImage.host
      const uploadedUrls = [];
      for (const file of req.files) {
        const form = new FormData();
        form.append("key", "6d207e02198a847aa98d0a2a901485a5");
        form.append("action", "upload");
        form.append("source", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
        form.append("format", "json");

        const resp = await fetch("https://freeimage.host/api/1/upload", {
          method: "POST",
          headers: form.getHeaders(),
          body: form
        });
        const data = await resp.json();
        if (data?.image?.url) uploadedUrls.push(data.image.url);
      }

      // Handle discount date and sale type
      const discountDate = discountValidUntil
        ? moment.tz(discountValidUntil, "Asia/Kolkata").toDate()
        : null;
      const finalSaleType = saleType === "Other" ? customSaleName : saleType;

      if (saleType === "Other" && !customSaleName) {
        return res.status(400).json({ message: "Custom sale name required" });
      }

      const newProduct = new Product({
        productId,
        productName,
        productDetails,
        originalPrice,
        priceDiscount: saleType === "Regular" ? 0 : priceDiscount,
        discountValidUntil: saleType === "Regular" ? null : discountDate,
        productDescription,
        productImages: uploadedUrls,
        productTags: Array.isArray(productTags) ? productTags : productTags.split(",").map(t => t.trim()),
        category,
        saleType: finalSaleType,
        stock,
        productOwner,
        companyName
      });

      await newProduct.save();
      res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
      console.error("insertProduct error:", error);
      res.status(500).json({ message: "Failed to add product. Please try again.", error: error.toString() });
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

const editProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: "Image upload failed", error: err.message });

    const { productId } = req.params;
    try {
      const {
        productName,productDetails, originalPrice, priceDiscount, productDescription,
        productTags, category, stock, saleType, customSaleName,
        discountValidUntil, imagesToKeep
      } = req.body;

      const product = await Product.findOne({ productId });
      if (!product) return res.status(404).json({ message: "Product not found" });

      let updatedImages = imagesToKeep ? JSON.parse(imagesToKeep) : [];

      // Upload new images
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const form = new FormData();
          form.append("key", "6d207e02198a847aa98d0a2a901485a5");
          form.append("action", "upload");
          form.append("source", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
          });
          form.append("format", "json");

          const response = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          });

          const data = await response.json();
          if (data?.image?.url) updatedImages.push(data.image.url);
        }
      }

      const finalSaleType = saleType === "Other" ? customSaleName : saleType;
      const discountDate = discountValidUntil
        ? moment.tz(discountValidUntil, "Asia/Kolkata").toDate()
        : null;

      // Update all fields
      product.productName = productName;
      product.productDetails= productDetails;
      product.originalPrice = originalPrice;
      product.priceDiscount = finalSaleType === "Regular" ? 0 : priceDiscount;
      product.productDescription = productDescription;
      product.productTags = typeof productTags === "string"
        ? productTags.split(",").map(t => t.trim())
        : productTags;
      product.category = category;
      product.stock = stock;
      product.saleType = finalSaleType;
      product.discountValidUntil = finalSaleType === "Regular" ? null : discountDate;
      product.productImages = updatedImages;

      await product.save();
      res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
      console.error("Error updating product", error);
      res.status(500).json({ message: "Error updating product", error: error.message });
    }
  });
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    // Find the product by productId
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove the product using deleteOne()
    await Product.deleteOne({ productId }); // Use the model to delete the product
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

const searchProducts = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Missing search query" });

  try {
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { productTags: { $regex: query, $options: "i" } },
        { productDescription: { $regex: query, $options: "i" } },
      ],
    }).select("productId productName originalPrice priceDiscount productImages");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Search error", error: error.message });
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
  searchProducts,
};
