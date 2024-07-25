const express = require('express');
const product_route = express.Router()
const userProController =require('../../controllers/userProductController')

product_route.get('/product/:id',userProController.getProductById)


module.exports = product_route
