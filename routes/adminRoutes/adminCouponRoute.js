const express = require('express');
const couponRoute = express.Router();
const couponControl = require('../../controllers/adminControllers/adminCouponController');
const isAdmin = require('../../middleware/isAdmin');

couponRoute.get('/create-coupon' , isAdmin , couponControl.getCreateCoupon);
couponRoute.post('/create-coupon' , isAdmin , couponControl.createCoupon);
couponRoute.get('/show-coupon' , isAdmin , couponControl.getCoupons);
couponRoute.get('/edit-coupon/:id' ,isAdmin , couponControl.getCouponById);
couponRoute.post('/edit-coupon/:id' ,isAdmin , couponControl.updateCouponById);
couponRoute.get('/delete/:id', couponControl.deleteCoupon);
couponRoute.get('/restore/:id', couponControl.restoreCoupon);
couponRoute.get('/remove-coupon/:id', couponControl.removeCoupon);






module.exports =couponRoute