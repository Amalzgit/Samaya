const express = require('express');
const adminBrandController =require('../../controllers/adminControllers/adminBrandController');
const adminBrand_route =express.Router();
const {uploadBrand} =require('../../utils/multer')

adminBrand_route.get('/brands',adminBrandController.getBrands)
adminBrand_route.get('/create-brand',adminBrandController.getCreateBrands)
adminBrand_route.post('/create-brand',uploadBrand.single('brandLogo') , adminBrandController.createBrand)

module.exports= adminBrand_route