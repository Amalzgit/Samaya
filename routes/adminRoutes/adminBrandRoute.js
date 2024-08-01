const express = require('express');
const adminBrandController = require('../../controllers/adminControllers/adminBrandController');
const adminBrand_route = express.Router();
const { uploadBrand } = require('../../utils/multer');
const { brandValidator } = require('../../middleware/validator');

adminBrand_route.get('/brands', adminBrandController.getBrands);
adminBrand_route.get('/create-brand', adminBrandController.getCreateBrands);
adminBrand_route.post('/create-brand', uploadBrand.single('brandLogo'), adminBrandController.createBrand);
adminBrand_route.get('/edit-brand/:brandId', adminBrandController.loadEditBrand);
adminBrand_route.post('/edit-brand/:brandId', uploadBrand.single('brandLogo'), brandValidator, adminBrandController.editBrand);
adminBrand_route.get('/delete-brand/:brandId', adminBrandController.deleteBrand);
adminBrand_route.get('/restore-brand/:brandId', adminBrandController.restoreBrand);
adminBrand_route.get('/remove-brand/:brandId', adminBrandController.removeBrand);

module.exports = adminBrand_route;
