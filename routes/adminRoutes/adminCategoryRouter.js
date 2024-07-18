const express =require('express');
 const admin_categoryRoute = express.Router()
const categoryController =require('../../controllers/adminControllers/adminCatogoryController')

admin_categoryRoute.get('/categories',categoryController.categoryView);
admin_categoryRoute.get('/createCategory',categoryController.loadAddCategory);
admin_categoryRoute.post('/createCategory',categoryController.addCategory)
admin_categoryRoute.get('/edit-category',categoryController.loadEditCategory);
admin_categoryRoute.post('/edit-category/:categoryId',categoryController.editCategory);
admin_categoryRoute.get('/delete-category/:categoryId',categoryController.deleteCategory);
admin_categoryRoute.get('/restore-category/:categoryId',categoryController.restoreCategory)

 module.exports=admin_categoryRoute