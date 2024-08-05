const express = require('express');
const adminBrandController = require('../../controllers/adminControllers/adminBrandController');
const adminBrand_route = express.Router();
const { uploadBrand } = require('../../utils/multer');
const { brandValidator } = require('../../middleware/validator');
const isAdmin = require('../../middleware/isAdmin');

adminBrand_route.get('/brands', isAdmin,adminBrandController.getBrands);
adminBrand_route.get('/create-brand', isAdmin,adminBrandController.getCreateBrands);
adminBrand_route.post('/create-brand', uploadBrand.single('brandLogo'), isAdmin,adminBrandController.createBrand);
adminBrand_route.get('/edit-brand/:brandId', isAdmin,adminBrandController.loadEditBrand);
adminBrand_route.post('/edit-brand/:brandId', uploadBrand.single('brandLogo'), brandValidator, isAdmin,adminBrandController.editBrand);
adminBrand_route.get('/delete-brand/:brandId', isAdmin,adminBrandController.deleteBrand);
adminBrand_route.get('/restore-brand/:brandId', isAdmin,adminBrandController.restoreBrand);
adminBrand_route.get('/remove-brand/:brandId', isAdmin,adminBrandController.removeBrand);

module.exports = adminBrand_route;
