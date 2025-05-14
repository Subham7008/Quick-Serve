const express = require("express");
const shopOwnerController=require("../controllers/shop_owners.controller");
const shopOwnerRouter = express.Router();

shopOwnerRouter
.route("/register").
post(shopOwnerController.register);


shopOwnerRouter
.route("/login/send-otp").
post(shopOwnerController.sendOtp);


shopOwnerRouter
.route("/login/verify-otp").
post(shopOwnerController.verifyOtp)
  
module.exports=shopOwnerRouter;


