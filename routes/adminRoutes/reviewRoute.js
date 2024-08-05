const express =require('express');
const review_route =express.Router();
const reviewController = require('../../controllers/reviewController');
const isAdmin = require('../../middleware/isAdmin');


review_route.get('/show-review',isAdmin,reviewController.getReview)


module.exports =review_route