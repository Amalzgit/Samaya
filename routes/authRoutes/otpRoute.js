const express = require('express');
const otp_route = express.Router();
const otpControlle = require('../../controllers/otpController');



//loading the otp verificaton page after sending the otp
otp_route.get("/verifyOtp",otpControlle.otpVPage);

//from here redirecting to home page if otp is correct
otp_route.post("/verifyOtp",otpControlle.verifyOtp);

//resend otp route
otp_route.get("/resendOtp",otpControlle.resendOtp);

module.exports = otp_route;
