const productController = require("../controllers/productcontroller");

const express = require("express");
const productRouter = express.Router();

// Add new product
productRouter.post("/addproduct", productController.insertProduct);

// Get product by productId
productRouter.get("/product/:productId", productController.getProductById);

productRouter.get("/products", productController.getAllProducts);

productRouter.get("/saleproducts", productController.getAllNonRegularProducts);

// Get products by productOwner
productRouter.get("/owner/:productOwner", productController.getProductsByOwner);

// Edit product by productId
productRouter.put("/product/:productId", productController.editProduct);

// Delete product by productId
productRouter.delete("/product/:productId", productController.deleteProduct);

productRouter.get("/products/search", productController.searchProducts);

module.exports = productRouter;
