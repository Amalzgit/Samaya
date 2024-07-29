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
userdetials_route.get('/user-details', isUser,userDetails.loadUserDetails)
userdetials_route.post('/user-details', isUser, userDetails.updateUSer)

module.exports =userdetials_route  