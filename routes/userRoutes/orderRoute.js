const express = require('express');
const order_Route =express.Router()
const orderController =require('../../controllers/orderController')

order_Route.post('/place-order',orderController.placeOrder)


module.exports = order_Route



