const User = require("../models/User");
const Product = require("../models/Product");
const multer = require("multer");
const FormData = require("form-data");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image"); // for user profile image upload

const insertuser = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: "Image upload error", error: err.message });

    try {
      const { username, email, address, contact, password } = req.body;
      let imageUrl = "";

      if (req.file) {
        const form = new FormData();
        form.append("key", "6d207e02198a847aa98d0a2a901485a5");
        form.append("action", "upload");
        form.append("source", req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        form.append("format", "json");

        const resp = await fetch("https://freeimage.host/api/1/upload", {
          method: "POST",
          body: form,
          headers: form.getHeaders()
        });

        const data = await resp.json();
        if (data?.image?.url) imageUrl = data.image.url;
      }

      const user = new User({
        username,
        email,
        address,
        contact,
        password,
        image: imageUrl
      });

      await user.save();
      res.status(200).json({ message: "Registered Successfully" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
};

const checkemail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    res.status(200).json({ message: "Email is available" });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

const checkuserlogin = async (req, res) => {
  try {
    const input = req.body;
    const user = await User.findOne(input);
    if (!user) {
      return res.status(404).send("user not found");
    }

    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: "Image upload failed", error: err.message });

    try {
      const { userid, username, address, contact, newPassword } = req.body;
      let updateFields = { username, address, contact };

      if (newPassword) updateFields.password = newPassword;

      if (req.file) {
        const form = new FormData();
        form.append("key", "6d207e02198a847aa98d0a2a901485a5");
        form.append("action", "upload");
        form.append("source", req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        form.append("format", "json");

        const response = await fetch("https://freeimage.host/api/1/upload", {
          method: "POST",
          body: form,
          headers: form.getHeaders(),
        });

        const data = await response.json();
        if (data?.image?.url) updateFields.image = data.image.url; // ✅ FIXED KEY
      }

      const updated = await User.findOneAndUpdate({ userid }, updateFields, { new: true });
      const { password, ...rest } = updated.toObject();
      res.json(rest);
    } catch (err) {
      res.status(500).json({ message: "Error updating", error: err.message });
    }
  });
};


const updateRecentProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(200).json({ message: "No update needed" });
    }

    const user = await User.findOne({ userid: userId });
    if (!user) return res.status(200).json({ message: "User not found" });

    if (!Array.isArray(user.recentProducts)) user.recentProducts = [];

    user.recentProducts = user.recentProducts.filter(id => id !== productId);
    user.recentProducts.unshift(productId);

    if (user.recentProducts.length > 10) {
      user.recentProducts = user.recentProducts.slice(0, 10);
    }

    await user.save();
    return res.status(200).json({ message: "Recent products updated" });
  } catch (error) {
    console.log("Silent update error:", error.message);
    return res.status(200).json({ message: "Silent fail - no error thrown" });
  }
};

const saveSearchQuery = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.body;

  if (!query) return res.status(400).json({ message: "Query required" });

  try {
    await User.findOneAndUpdate(
      { userid: userId },
      { $addToSet: { searchHistory: query } }
    );
    res.json({ message: "Search query saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSearchHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.searchHistory || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRecentAndRecommendedProducts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const recent = await Product.find({
      productId: { $in: user.recentProducts.slice(-5).reverse() }
    }).lean();

    const recentCategories = [...new Set(recent.map(p => p.category))];
    const recentProductIds = new Set(user.recentProducts);

    const recommended = await Product.find({
      category: { $in: recentCategories },
      productId: { $nin: Array.from(recentProductIds) }
    }).limit(5).lean();

    res.json({ recent, recommended });
  } catch (error) {
    console.error("Error fetching recent/recommended:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  insertuser,
  checkuserlogin,
  checkemail,
  updateUser,
  updateRecentProduct,
  saveSearchQuery,
  getSearchHistory,
  getRecentAndRecommendedProducts,
};
