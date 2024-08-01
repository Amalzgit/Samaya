const express =require('express');
const userdetials_route = express.Router();
const userDetails =require('../../controllers/userDetailsController')


const isUser = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            return res.redirect('/admin/adminhome');
        }
    }
    next()
}



// userdetials_route.use(noCache)
// userdetials_route.use(isUser)
userdetials_route.get('/user-details', isUser,userDetails.loadUserDetails);
userdetials_route.post('/user-details', isUser, userDetails.updateUser);
userdetials_route.get('/add-address', isUser, userDetails.loadAddAddress);
userdetials_route.post('/add-address', userDetails.addAddress);
userdetials_route.get('/edit-address/:addressId',userDetails.loadEditAddress)
userdetials_route.post('/edit-address/:addressId',userDetails.editAddress)
userdetials_route.get('/delete-address/:addressId',userDetails.deleteAddress)


module.exports =userdetials_route  