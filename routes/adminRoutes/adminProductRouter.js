const express = require('express');
const adminProductController = require('../../controllers/adminControllers/adminProductController');
const {productValidator} =require('../../middleware/validator')
const adminProductRoute = express.Router();
const {uploadProduct} =require('../../utils/multer');
const isAdmin = require('../../middleware/isAdmin');




adminProductRoute.get('/product-list',isAdmin, adminProductController.loadproductList);
adminProductRoute.get('/add-product', isAdmin ,adminProductController.loadAddproduct);
adminProductRoute.post('/add-product',uploadProduct.array('images',10),  productValidator, isAdmin ,adminProductController.addproduct);
adminProductRoute.get('/product-edit/:productId', isAdmin ,adminProductController.loadEditProduct)
adminProductRoute.post('/product-edit/:productId',uploadProduct.array('images',10),  productValidator, isAdmin ,adminProductController.productEdit)
adminProductRoute.get('/delete-product/:productId', isAdmin ,adminProductController.deleteProduct);
adminProductRoute.get('/restore-product/:productId', isAdmin ,adminProductController.restoreProduct)
adminProductRoute.get('/remove-product/:productId', isAdmin ,adminProductController.removeProduct)



module.exports = adminProductRoute