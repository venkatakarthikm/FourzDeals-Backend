const Review = require("../models/Review");
const multer = require("multer");
const moment = require("moment-timezone");
const FormData = require("form-data");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("images", 15);

const insertReview = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: "Image upload failed", error: err.message });

    try {
      const { username, email, productid, description, userId } = req.body;

      // ✅ Check if user already reviewed this product
      const existing = await Review.findOne({ userId: Number(userId), productid });
      if (existing) return res.status(400).json({ message: "You already reviewed this product." });

      const images = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const form = new FormData();
          form.append("key", "6d207e02198a847aa98d0a2a901485a5");
          form.append("action", "upload");
          form.append("source", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
            knownLength: file.size,
          });
          form.append("format", "json");

          const resp = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          });

          const data = await resp.json();
          if (data?.image?.url) images.push(data.image.url);
        }
      }

      const review = new Review({
        username,
        email,
        userId: Number(userId),
        productid,
        description,
        images,
      });

      await review.save();
      res.status(201).json({ message: "Review added successfully", review });
    } catch (e) {
      console.error("Insert Review Error:", e);
      res.status(500).json({ message: "Error adding review", error: e.message });
    }
  });
};

const editReview = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: "Image upload failed", error: err.message });

    try {
      const { reviewid, description, imagesToKeep, userId } = req.body;
      const review = await Review.findOne({ reviewid: Number(reviewid), userId: Number(userId) });
      if (!review) return res.status(404).json({ message: "Review not found or not owned by you" });

      const keepList = imagesToKeep ? JSON.parse(imagesToKeep) : [];
      const newImages = [...keepList];

      if (req.files && req.files.length) {
        for (const file of req.files) {
          const form = new FormData();
          form.append("key", "6d207e02198a847aa98d0a2a901485a5");
          form.append("action", "upload");
          form.append("source", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
          });
          form.append("format", "json");

          const resp = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          });

          const data = await resp.json();
          if (data?.image?.url) newImages.push(data.image.url);
        }
      }

      review.description = description;
      review.images = newImages;
      review.updatedAt = moment().toDate();
      await review.save();
      res.json({ message: "Review updated", review });
    } catch (e) {
      res.status(500).json({ message: "Error editing review", error: e.message });
    }
  });
};

const deleteReview = async (req, res) => {
  try {
    const { reviewid, userId } = req.body;
    const result = await Review.deleteOne({ reviewid: Number(reviewid), userId: Number(userId) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Review not found or not yours" });
    res.json({ message: "Review deleted" });
  } catch (e) {
    res.status(500).json({ message: "Error deleting review", error: e.message });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productid: productId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

module.exports = {
  insertReview,
  editReview,
  deleteReview,
  getReviewsByProductId,
};
