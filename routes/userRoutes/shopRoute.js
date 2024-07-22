const express =require('express');
const shopController = require('../../controllers/shopController');
const upload = require('../../utils/multer')
const shop_route =express.Router();



shop_route.get('/shop',upload.array('images',3),shopController.loadShop)


module.exports = shop_route