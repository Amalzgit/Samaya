const express = require('express');
const user_route = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const authrise = require('../middleware/autheriseMiddleare');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const config = require('../config/config');
const { registrationValidator } = require('../middleware/validator');

// Session middleware configuration
user_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Static file serving middleware
user_route.use(express.static(path.join(__dirname, '../public')));

// Multer storage configuration for file uploads
/*
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
*/

// ROUTES

user_route.get('/register', registrationValidator, authrise.isUser, auth.isLogout, userController.loadRegister);
user_route.post('/register', registrationValidator,  authrise.isUser, userController.insertUser);
user_route.get('/home', authrise.isUser, auth.isLogin, userController.loadHome);

// Uncomment if these routes are part of your application flow
/*
user_route.get('/', authrise.isUser, auth.isLogout, userController.loginLoad);
user_route.get('/login', authrise.isUser, auth.isLogout, userController.loginLoad);
user_route.post('/login', authrise.isUser, userController.verifyLogin);
user_route.get('/logout', authrise.isUser, auth.isLogin, userController.userLogout);
*/

module.exports = user_route;
