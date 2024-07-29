const express = require('express');
const adminProductController = require('../../controllers/adminControllers/adminProductController');
const {productValidator} =require('../../middleware/validator')
const adminProductRoute = express.Router();
const {uploadProduct} =require('../../utils/multer');


// const isAdmin = (req, res, next) => {
//     if (req.session.user_id) {
//         const isAdmin = req.session.isAdmin;
//         if (isAdmin) {
//             next()
//         }
//         else {
//             return res.redirect('/')
//         }
//     }   
//      res.redirect('/login')
// }

adminProductRoute.get('/product-list', adminProductController.loadproductList);
adminProductRoute.get('/add-product', adminProductController.loadAddproduct);
adminProductRoute.post('/add-product',uploadProduct.array('images',10),  productValidator, adminProductController.addproduct);
adminProductRoute.get('/product-edit/:productId', adminProductController.loadEditProduct)
adminProductRoute.post('/product-edit/:productId',uploadProduct.array('images',10),  productValidator, adminProductController.productEdit)
adminProductRoute.get('/delete-product/:productId', adminProductController.deleteProduct);
adminProductRoute.get('/restore-product/:productId', adminProductController.restoreProduct)
adminProductRoute.get('/remove-product/:productId', adminProductController.removeProduct)



module.exports = adminProductRoute