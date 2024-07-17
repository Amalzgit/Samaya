const express = require('express');
const adminProductController = require('../../controllers/adminControllers/adminProductController');
const adminProductRoute = express.Router();

adminProductRoute.get('/products',adminProductController.loadproducts)

module.exports = adminProductRoute