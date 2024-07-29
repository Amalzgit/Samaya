const express =require('express');
const shopController = require('../../controllers/shopController');
// const upload = require('../../utils/multer');
const shop_route =express.Router();

const isUser = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            return res.redirect('/admin/adminhome');
        }
    }
    next()
}


shop_route.get('/shop', isUser, shopController.loadShop)


module.exports = shop_route