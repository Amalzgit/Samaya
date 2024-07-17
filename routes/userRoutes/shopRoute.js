const express =require('express');
const path =require('path')
const shopController = require('../../controllers/shopController')
const shop_route =express();


shop_route.use(express.static(path.join(__dirname, '../public')));

// Set view engine and views directory for rendering views
shop_route.set('view engine', 'ejs');
shop_route.set('views', path.join(__dirname,'../../views/users'));


shop_route.get('/shop',shopController.loadShop)


module.exports = shop_route