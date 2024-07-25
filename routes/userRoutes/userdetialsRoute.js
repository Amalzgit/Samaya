const express =require('express');
const userdetials_route = express.Router();
const userDetails =require('../../controllers/userDetailsController')
const isUser = require('../../middleware/authMiddleware')


userdetials_route.get('/user-details',isUser.isLogedin,userDetails.loadUserDetails)
userdetials_route.post('/user-details',isUser.isLogedin,userDetails.updateUSer)

module.exports =userdetials_route  