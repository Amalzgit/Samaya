const express = require('express');
const adminProductController = require('../../controllers/adminControllers/adminProductController');
const adminProductRoute = express.Router();
const upload =require('../../utils/multer')
const productValidator = require('../../middleware/validator')

adminProductRoute.get('/product-list',adminProductController.loadproductList);
adminProductRoute.get('/add-product',adminProductController.loadAddproduct);
adminProductRoute.post('/add-product',productValidator.productValidator,upload.array('images',3),adminProductController.addproduct);
// adminProductRoute.post('delete-product/:productId',adminProductController.deleteProduct)



module.exports = adminProductRoute