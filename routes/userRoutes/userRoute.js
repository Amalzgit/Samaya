const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const userController = require('../../controllers/userController');
const session = require('express-session');
const path = require('path');
const config = require('../../config/Sessionconfig');
const shop_route = require('./shopRoute');
const userdetials_route = require('./userdetialsRoute');
const product_route = require('./productRoute');
const nocache = require('../../middleware/nocache');
const cart_Route = require('./cartRoute');
const isUser = require('../../middleware/isUser');
const order_Route = require('./orderRoute');
// const nocache = require('nocache');
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
user_route.get('/', nocache, isUser, userController.loadHome);
user_route.use(shop_route)
user_route.use(product_route)

// PRIVATE ROUTES
user_route.use(userdetials_route);
user_route.use(cart_Route);
user_route.use(order_Route)

module.exports = user_route;
