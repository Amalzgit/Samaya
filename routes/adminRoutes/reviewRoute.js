const express =require('express');
const review_route =express.Router();
const reviewController = require('../../controllers/reviewController')


review_route.get('/show-review',reviewController.getReview)


module.exports =review_route