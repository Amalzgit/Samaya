const express= require('express');
const cartController = require('../../controllers/cartController');
const isAuth = require('../../middleware/isAuth');
const isUser = require('../../middleware/isUser');
const cart_Route = express.Router()


cart_Route.get('/cart',isAuth,isUser,cartController.loadCart)
cart_Route.post('/cart/add',isAuth, isUser,cartController.addItemToCart)
cart_Route.post('/cart/remove',isAuth, isUser, cartController.removeItemFromCart);
cart_Route.post('/cart/clear',isAuth,isUser, cartController.clearCart);



cart_Route.post('/cart/update', cartController. updateCart);

// cart_Route.get('/checkout',isAuth,isUser, cartController.loadCheckout);
// cart_Route.post('/place-order',isAuth, isUser, cartController.placeOrder);
// // cart_Route.get('/order-confirmation/:orderId', cartController.placedOrder);


module.exports =cart_Route


