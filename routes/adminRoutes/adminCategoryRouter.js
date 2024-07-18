const express =require('express');
 const admin_categoryRoute = express.Router()
const categoryController =require('../../controllers/adminControllers/adminCatogoryController')

admin_categoryRoute.get('/categories',categoryController.categoryView)


 module.exports=admin_categoryRoute