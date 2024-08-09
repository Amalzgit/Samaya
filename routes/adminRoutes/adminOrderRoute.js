const express = require('express');
const adminOrder =express.Router();
const adminOrderController =require('../../controllers/adminControllers/adminOrderController');
const isAdmin = require('../../middleware/isAdmin');



adminOrder.get ('/orderList', isAdmin, adminOrderController.getOrderList);
adminOrder.post('/update-order-status/:orderId',isAdmin, adminOrderController.updateOrderStatus);
adminOrder.get('/order-details/:orderId',isAdmin, adminOrderController.showOrderdetails);


module.exports =adminOrder;