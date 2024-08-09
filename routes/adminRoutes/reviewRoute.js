const express =require('express');
const review_route =express.Router();
const reviewController = require('../../controllers/reviewController');
const isAdmin = require('../../middleware/isAdmin');
const nocache = require('../../middleware/nocache');


review_route.get('/show-review',nocache, isAdmin,reviewController.getReview)


module.exports =review_route