const express =require('express');
const shopController = require('../../controllers/shopController');
const isUser = require('../../middleware/isUser');
// const upload = require('../../utils/multer');
const shop_route =express.Router();



shop_route.get('/shop', isUser, shopController.loadShop)


module.exports = shop_route