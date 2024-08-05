const express = require('express');
const otp_route = express.Router();
const otpControlle = require('../../controllers/otpController');
const nocache = require('../../middleware/nocache');

const isLoggedIn = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if(isAdmin){
            return res.redirect('/admin/adminhome');
        }
        return res.redirect('/');
    } else {
        next()
    }
}

otp_route.get("/verifyOtp",nocache, isLoggedIn, otpControlle.otpVPage);

otp_route.post("/verifyOtp",nocache, isLoggedIn, otpControlle.verifyOtp);

//resend otp route
otp_route.get("/resendOtp",nocache, isLoggedIn, otpControlle.resendOtp);

module.exports = otp_route;
