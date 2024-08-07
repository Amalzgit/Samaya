const express = require('express');
const order_Route =express.Router()
const orderController =require('../../controllers/orderController');
const isUser = require('../../middleware/isUser');
const isAuth = require('../../middleware/isAuth');

order_Route.post('/place-order',isAuth, isUser, orderController.placeOrder)
order_Route.get('/order-placed/:orderId',isAuth, isUser, orderController. showOrderPlaced);

module.exports = order_Route



