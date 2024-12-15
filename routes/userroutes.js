const usercontroller = require("../controllers/usercontroller")

const express = require("express")
const userrouter = express.Router()

// user routes
userrouter.post("/insertuser",usercontroller.insertuser)
userrouter.post("/checkuserlogin",usercontroller.checkuserlogin)
userrouter.post("/checkemail",usercontroller.checkemail)


module.exports = userrouter