const express= require('express');
const cartController = require('../../controllers/cartController');
const isAuth = require('../../middleware/isAuth');
const isUser = require('../../middleware/isUser');
const nocache =require('../../middleware/nocache');
const cart_Route = express.Router()


cart_Route.get('/cart',isAuth,isUser,cartController.loadCart)
cart_Route.post('/cart/add',isAuth, isUser,cartController.addItemToCart)
cart_Route.post('/cart/remove',isAuth, isUser, cartController.removeItemFromCart);
cart_Route.post('/cart/clear',isAuth,isUser, cartController.clearCart);
cart_Route.post('/cart/update',isAuth,isUser, cartController. updateCart);

cart_Route.get('/checkout-add-address', isUser, cartController.loadAddAddress);
cart_Route.post('/checkout-add-address', isUser, cartController.addAddress);

cart_Route.post('/cart/apply-coupon', isAuth , isUser ,cartController.applyCoupon)
cart_Route.post('/cart/remove-coupon',isAuth, isUser,cartController.removeCoupon )

// checkout

cart_Route.post('/checkout',nocache , isAuth, isUser, cartController.Checkout);
cart_Route.get ('/checkout-page',nocache, isAuth, isUser , cartController.getCheckout);
cart_Route.post('/update-selected-address',nocache , isAuth,isUser,cartController.changeAddress);


module.exports =cart_Route


