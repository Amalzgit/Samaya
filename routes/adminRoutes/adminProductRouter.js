const express = require('express');
const adminProductController = require('../../controllers/adminControllers/adminProductController');
const adminProductRoute = express.Router();
const upload =require('../../utils/multer');


const isAdmin = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            next()
        }
        else {
            return res.redirect('/')
        }
    }   
     res.redirect('/login')
}

adminProductRoute.get('/product-list',isAdmin,adminProductController.loadproductList);
adminProductRoute.get('/add-product',isAdmin,adminProductController.loadAddproduct);
adminProductRoute.post('/add-product',upload.array('images',10),isAdmin,adminProductController.addproduct);
adminProductRoute.get('/product-edit/:productId',isAdmin,adminProductController.loadEditProduct)
adminProductRoute.post('/product-edit/:productId',upload.array('images',10),isAdmin,adminProductController.productEdit)
adminProductRoute.get('/delete-product/:productId',isAdmin,adminProductController.deleteProduct);
adminProductRoute.get('/restore-product/:productId',isAdmin,adminProductController.restoreProduct)



module.exports = adminProductRoute