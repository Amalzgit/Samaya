const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const userController = require('../../controllers/userController');
const session = require('express-session');
const path = require('path');
const config = require('../../config/Sessionconfig');
const shop_route = require('./shopRoute');
const userdetials_route = require('./userdetialsRoute');
const product_route = require('./productRoute');
const noCache = require('../../middleware/noCacheMiddleware');
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

const isUser = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            return res.redirect('/admin/adminhome');
        }
    }
    next()
}


// PUBLIC ROUTES
user_route.get('/', noCache, isUser, userController.loadHome);
user_route.use(shop_route)
user_route.use(product_route)

// PRIVATE ROUTES
user_route.use(userdetials_route)


module.exports = user_route;
