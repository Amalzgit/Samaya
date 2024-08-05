const express = require('express');
const product_route = express.Router()
const userProController =require('../../controllers/userProductController');
const isUser = require('../../middleware/isUser');


// product_route.post('/add-review',isUser,userProController.addReview)
product_route.get('/product/:id',isUser, userProController.getProductById)


module.exports = product_route
