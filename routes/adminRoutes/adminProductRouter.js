const express = require('express');
const adminProductController = require('../../controllers/adminControllers/adminProductController');
const adminProductRoute = express.Router();
const upload =require('../../utils/multer')


adminProductRoute.get('/product-list',adminProductController.loadproductList);
adminProductRoute.get('/add-product',adminProductController.loadAddproduct);
adminProductRoute.post('/add-product',upload.array('images',3),adminProductController.addproduct);
adminProductRoute.get('/product-edit/:productId',adminProductController.loadEditProduct)
adminProductRoute.post('/product-edit/:productId',upload.array('images',3),adminProductController.productEdit)
adminProductRoute.get('/delete-product/:productId',adminProductController.deleteProduct);
adminProductRoute.get('/restore-product/:productId',adminProductController.restoreProduct)



module.exports = adminProductRoute