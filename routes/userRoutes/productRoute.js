const express = require('express');
const product_route = express.Router()
const userProController =require('../../controllers/userProductController');

const isUser = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            return res.redirect('/admin/adminhome');
        }
    }
    next()
}


// product_route.post('/add-review',isUser,userProController.addReview)
product_route.get('/product/:id',isUser, userProController.getProductById)


module.exports = product_route
