const express =require('express');
const adminProfileRoute =express.Router();
const adminprofileControl =require('../../controllers/adminControllers/adminProfileController');
const isAdmin = require('../../middleware/isAdmin');




adminProfileRoute.get('/adminprofile',isAdmin, adminprofileControl.loadAdminProfile);
adminProfileRoute.get('/show-users',isAdmin ,adminprofileControl.showUser)
adminProfileRoute.get('/block-user/:user_id', isAdmin , adminprofileControl.blockUser);
adminProfileRoute.get('/unblock-user/:user_id', isAdmin, adminprofileControl.unblockUser);
adminProfileRoute.post('/update-admin',isAdmin, adminprofileControl.updateAdmin)


module.exports =adminProfileRoute