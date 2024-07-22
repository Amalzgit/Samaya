const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const userController = require('../../controllers/userController');
// const auth = require('../../middleware/authMiddleware');
// const authrise = require('../../middleware/autheriseMiddleare');
const session = require('express-session');
const path = require('path');
const config = require('../../config/Sessionconfig');
const shop_route = require('./shopRoute');
const userdetials_route = require('./userdetialsRoute');
const user_route = express();

// Session middleware configuration
user_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Static file serving middleware
user_route.use(express.static(path.join(__dirname, '../public')));

user_route.set('views', './views/users');
user_route.use(expressLayouts)
user_route.set('layout', './layouts/userLayouts')
user_route.set('view engine', 'ejs')

// PUBLIC ROUTES
user_route.get('/', userController.loadHome);
user_route.use(shop_route)
user_route.use(userdetials_route)
// PRIVATE ROUTES
user_route.use(userdetials_route)

module.exports = user_route;
