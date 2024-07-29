const express =require('express');
const adminProfileRoute =express.Router();
const adminprofileControl =require('../../controllers/adminControllers/adminProfileController');

// const isAdmin = (req, res, next) => {
//     if (req.session.user_id) {
//         const isAdmin = req.session.isAdmin;
//         if (isAdmin) {
//             next()
//         }
//         else {
//             return res.redirect('/')
//         }
//     }   
//      res.redirect('/login')
// }


adminProfileRoute.get('/adminprofile', adminprofileControl.loadAdminProfile);
adminProfileRoute.get('/show-users',adminprofileControl.showUser)
adminProfileRoute.get('/block-user/:user_id', adminprofileControl.blockUser);
adminProfileRoute.get('/unblock-user/:user_id', adminprofileControl.unblockUser);
adminProfileRoute.post('/update-admin',adminprofileControl.updateAdmin)


module.exports =adminProfileRoute