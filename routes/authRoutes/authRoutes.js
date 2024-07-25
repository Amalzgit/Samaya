const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const config = require('../../config/Sessionconfig');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginController = require('../../controllers/loginController');
const auth = require('../../middleware/authMiddleware');
const { loginValidater } = require('../../middleware/validator');
const otp_route = require('./otpRoute');
const register_route = require('./registerRoute');
const noCache = require('../../middleware/noCacheMiddleware');

const auth_route = express();

// Session middleware
auth_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
auth_route.use(express.static(path.join(__dirname, 'public')));
auth_route.use(express.static('public'));

// Body parser middleware
auth_route.use(bodyParser.json());
auth_route.use(bodyParser.urlencoded({ extended: true }));

// Set view engine and views directory
auth_route.set('views', './views/auth');
auth_route.use(expressLayouts)
auth_route.set('layout', './layouts/authLayout')
auth_route.set('view engine', 'ejs')

auth_route.use(noCache);
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
// Routes
auth_route.get('/login', isLoggedIn, loginValidater, auth.isLogout, loginController.loginLoad);
auth_route.post('/login', isLoggedIn, loginValidater,  auth.isLogout, loginController.verifyLogin);
auth_route.get('/logout', auth.isLogedin, loginController.Logout);
auth_route.use(otp_route);
auth_route.use(register_route);
// Fallback route for unmatched routes

module.exports = auth_route;
