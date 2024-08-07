const express =require('express');
const userdetials_route = express.Router();
const userDetails =require('../../controllers/userDetailsController');
const isAuth = require('../../middleware/isAuth');
const isUser = require('../../middleware/isUser');




userdetials_route.get('/user-details', isAuth, isUser, userDetails.loadUserDetails);
userdetials_route.post('/user-details',isAuth, isUser, userDetails.updateUser);
userdetials_route.get('/add-address',isAuth, isUser, userDetails.loadAddAddress);
userdetials_route.post('/add-address',isAuth,isUser, userDetails.addAddress);
userdetials_route.get('/edit-address/:addressId',isAuth, isUser, userDetails.loadEditAddress);
userdetials_route.post('/edit-address/:addressId',isAuth,isUser, userDetails.editAddress);
userdetials_route.delete('/address/delete/:addressId',isAuth,isUser, userDetails.deleteAddress);



module.exports =userdetials_route  