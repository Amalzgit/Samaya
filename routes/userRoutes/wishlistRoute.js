
const express =require('express');
const { getWishlist, removeWishlistItem, addToWishList } = require('../../controllers/wishlistController');
const isAuth = require('../../middleware/isAuth');
const isUser = require('../../middleware/isUser');
const nocache = require('../../middleware/nocache');
const wishlistRoute = express.Router();

wishlistRoute. get ('/wishlist/',nocache, isAuth, isUser, getWishlist)                    
wishlistRoute. post('/wishlist/add',nocache, isAuth, isUser, addToWishList)                    
wishlistRoute. post ('/wishlist/remove',nocache, isAuth, isUser, removeWishlistItem)                    

module.exports = wishlistRoute