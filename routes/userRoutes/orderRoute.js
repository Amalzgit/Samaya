const express = require('express');
const order_Route =express.Router()
const orderController =require('../../controllers/orderController');
const isUser = require('../../middleware/isUser');
const isAuth = require('../../middleware/isAuth');

order_Route.post('/place-order',isAuth, isUser, orderController.placeOrder)
order_Route.post('/verify-razorpay-payment',isAuth, isUser, orderController.verifyRazorpayPayment)
order_Route.get('/order-placed/:orderId',isAuth, isUser, orderController. showOrderPlaced);
order_Route.get('/order-details/:orderId',isAuth, isUser, orderController. showOrderdetails);
order_Route.post('/cancel-item/:orderId/:itemId', isAuth, isUser, orderController.cancelOrderItem);
order_Route.post('/return-item/:orderId/:itemId', isAuth, isUser, orderController.returnOrderItem);

module.exports = order_Route



