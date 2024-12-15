const sellercontroller = require("../controllers/sellerController")

const express = require("express")
const sellerrouter = express.Router()

// user routes
sellerrouter.post("/insertseller",sellercontroller.insertseller)
sellerrouter.post("/checksellerlogin",sellercontroller.checksellerlogin)
sellerrouter.post("/scheckemail",sellercontroller.scheckemail)


module.exports = sellerrouter