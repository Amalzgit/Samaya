const express = require('express');
const config = require('../config/config');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const adminController = require('../controllers/adminController');

const admin_route = express();

// Session middleware
admin_route.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
admin_route.use(express.static(path.join(__dirname, 'public')));
admin_route.use(express.static('public'))

// Body parser middleware
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// Set view engine and views directory
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

// Routes
// admin_route.get('/', adminController.loadLogin);
// admin_route.post('/login', adminController.verifyLogin);
admin_route.get('/adminhome', adminController.loadAdminHome);

// Fallback route for unmatched routes
admin_route.get('*', function(req, res) {
    res.redirect('/admin');
});

module.exports = admin_route;
