const express = require('express');
const forgotPassRouter = express.Router();
const forgotPassController = require('../../controllers/forgotPassController');
const nocache = require('../../middleware/nocache');
forgotPassRouter.get('/forgot-password',nocache, forgotPassController.forgotPassword);

forgotPassRouter.post('/forgot-password',nocache, forgotPassController.sendOtp);

forgotPassRouter.post('/verify-otp',nocache, forgotPassController.verifyOtp);

forgotPassRouter.post('/update-password',nocache, forgotPassController.updatePassword);

module.exports = forgotPassRouter;