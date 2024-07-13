const express = require('express');
const config = require('../config/config');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginController = require('../controllers/loginController');
const authrise = require('../middleware/autheriseMiddleare'); 
const auth = require('../middleware/authMiddleware');
const { loginValidater } = require('../middleware/validator');

const login_route = express();

// Session middleware
login_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

// Body parser middleware
login_route.use(bodyParser.json());
login_route.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
login_route.use(express.static(path.join(__dirname, '../public')));

// Set view engine and views directory for rendering views
login_route.set('view engine', 'ejs');
login_route.set('views', path.join(__dirname, '../views/users'));

// Login routes
login_route.get('/', loginValidater, authrise.isUser, auth.isLogout, loginController.loginLoad);
login_route.get('/login', loginValidater,  authrise.isUser, auth.isLogout, loginController.loginLoad);
login_route.post('/login', loginValidater,  authrise.isUser, auth.isLogout, loginController.verifyLogin);
login_route.get('/logout', auth.isLogin, loginController.Logout);

module.exports = login_route;
