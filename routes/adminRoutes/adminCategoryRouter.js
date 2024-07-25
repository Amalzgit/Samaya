const express =require('express');
 const admin_categoryRoute = express.Router()
const categoryController =require('../../controllers/adminControllers/adminCatogoryController');

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

admin_categoryRoute.get('/categories',isAdmin, categoryController.categoryView);
admin_categoryRoute.get('/createCategory',isAdmin, categoryController.loadAddCategory);
admin_categoryRoute.post('/createCategory',isAdmin, categoryController.addCategory)
admin_categoryRoute.get('/edit-category/:categoryId',isAdmin, categoryController.loadEditCategory);
admin_categoryRoute.post('/edit-category/:categoryId',isAdmin, categoryController.editCategory);
admin_categoryRoute.post('/delete-category/:categoryId',isAdmin, categoryController.deleteCategory);
admin_categoryRoute.post('/restore-category/:categoryId',isAdmin, categoryController.restoreCategory)

 module.exports=admin_categoryRoute