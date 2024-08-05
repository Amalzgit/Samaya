const express =require('express');
 const admin_categoryRoute = express.Router()
const categoryController =require('../../controllers/adminControllers/adminCatogoryController');
const {categoryValidator}=require('../../middleware/validator');
const isAdmin = require('../../middleware/isAdmin');


admin_categoryRoute.get('/categories', isAdmin ,categoryController.categoryView);
admin_categoryRoute.get('/createCategory', isAdmin ,categoryController.loadAddCategory);
admin_categoryRoute.post('/createCategory', categoryValidator, isAdmin ,categoryController.addCategory)
admin_categoryRoute.get('/edit-category/:categoryId', isAdmin ,categoryController.loadEditCategory);
admin_categoryRoute.post('/edit-category/:categoryId', categoryValidator, isAdmin ,categoryController.editCategory);
admin_categoryRoute.get('/delete-category/:categoryId', isAdmin ,categoryController.deleteCategory);
admin_categoryRoute.get('/restore-category/:categoryId', isAdmin ,categoryController.restoreCategory)
admin_categoryRoute.get('/remove-category/:categoryId', isAdmin ,categoryController.removeCategory)


 module.exports=admin_categoryRoute