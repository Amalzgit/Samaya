const express = require('express');
const adminOrder =express.Router();
const adminOrderController =require('../../controllers/adminControllers/adminOrderController');



adminOrder.get ('/orderList',adminOrderController.getOrderList)
adminOrder.post('/update-order-status/:orderId', adminOrderController.updateOrderStatus)
module.exports =adminOrder;