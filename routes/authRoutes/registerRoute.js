const express = require('express');
const registrationController = require('../../controllers/registrationController');
const otpController =require('../../controllers/otpController')
const auth = require('../../middleware/authMiddleware');
const session = require('express-session');
const path = require('path');
const config = require('../../config/Sessionconfig');
const { registrationValidator } = require('../../middleware/validator');
const nocache = require('../../middleware/nocache');

const register_route = express.Router();

// Session middleware configuration
register_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Static file serving middleware
register_route.use(express.static(path.join(__dirname, '../public')));


register_route.get('/register',nocache, registrationValidator,  auth.isLogout,registrationController.loadRegister);
register_route.post('/register', nocache,registrationValidator,  otpController.generateOtp);

module.exports =register_route