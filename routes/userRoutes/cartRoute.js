const express= require('express');
const cartController = require('../../controllers/cartController');
const isAuth = require('../../middleware/isAuth');
const isUser = require('../../middleware/isUser');
const cart_Route = express.Router()


cart_Route.get('/cart',isAuth,isUser,cartController.loadCart)
cart_Route.post('/cart/add',isAuth, isUser,cartController.addItemToCart)
cart_Route.post('/cart/remove',isAuth, isUser, cartController.removeItemFromCart);
cart_Route.post('/cart/clear',isAuth,isUser, cartController.clearCart);
cart_Route.post('/cart/update',isAuth,isUser, cartController. updateCart);

// checkout

cart_Route.post('/checkout',isAuth, isUser, cartController.Checkout);
cart_Route.get ('/checkout-page',isAuth, isUser , cartController.getCheckout);
cart_Route.post('/update-selected-address', isAuth,isUser,cartController.changeAddress);


module.exports =cart_Route


