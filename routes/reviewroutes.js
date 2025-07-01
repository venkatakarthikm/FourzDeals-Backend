const express = require("express");
const {
  insertReview, editReview, deleteReview , getReviewsByProductId
} = require("../controllers/reviewController");
const router = express.Router();

router.post("/insertreview", insertReview);
router.post("/editreview", editReview);
router.post("/deletereview", deleteReview);
router.get("/reviews/:productId", getReviewsByProductId);


module.exports = router;
