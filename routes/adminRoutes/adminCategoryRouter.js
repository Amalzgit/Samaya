const express =require('express');
 const admin_categoryRoute = express.Router()
const categoryController =require('../../controllers/adminControllers/adminCatogoryController');
const {categoryValidator}=require('../../middleware/validator')

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

admin_categoryRoute.get('/categories', categoryController.categoryView);
admin_categoryRoute.get('/createCategory', categoryController.loadAddCategory);
admin_categoryRoute.post('/createCategory', categoryValidator, categoryController.addCategory)
admin_categoryRoute.get('/edit-category/:categoryId', categoryController.loadEditCategory);
admin_categoryRoute.post('/edit-category/:categoryId', categoryValidator, categoryController.editCategory);
admin_categoryRoute.get('/delete-category/:categoryId', categoryController.deleteCategory);
admin_categoryRoute.get('/restore-category/:categoryId', categoryController.restoreCategory)
admin_categoryRoute.get('/remove-category/:categoryId', categoryController.removeCategory)


 module.exports=admin_categoryRoute