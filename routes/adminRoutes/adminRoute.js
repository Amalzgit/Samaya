const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const config = require('../../config/config');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const adminController = require('../../controllers/adminControllers/adminController');
const adminProductRoute = require('./adminProductRouter');
const admin_categoryRoute = require('./adminCategoryRouter');

const admin_route = express();

// Session middleware
admin_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
admin_route.use(express.static('public'));

// Body parser middleware
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// Set view engine and views directory
admin_route.set('views', './views/admin');
admin_route.use(expressLayouts)
admin_route.set('layout', './layouts/adminLayout')
admin_route.set('view engine', 'ejs')

// Routes
admin_route.get('/adminhome', adminController.loadAdminHome);
admin_route.use(adminProductRoute);
admin_route.use(admin_categoryRoute)
// Fallback route for unmatched routes

module.exports = admin_route;
