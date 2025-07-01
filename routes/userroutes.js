const usercontroller = require("../controllers/usercontroller")

const express = require("express")
const userrouter = express.Router()

// user routes
userrouter.post("/insertuser",usercontroller.insertuser)
userrouter.post("/checkuserlogin",usercontroller.checkuserlogin)
userrouter.post("/checkemail",usercontroller.checkemail)
userrouter.post("/recent",usercontroller.updateRecentProduct)
userrouter.post("/users/:userId/search-history", usercontroller.saveSearchQuery);
userrouter.get("/users/:userId/search-history", usercontroller.getSearchHistory);
userrouter.post("/update-user", usercontroller.updateUser);
userrouter.get("/products/recent-recommended/:username", usercontroller.getRecentAndRecommendedProducts);

module.exports = userrouter