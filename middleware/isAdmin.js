module.exports = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
           return next()
        }
        else {
            return res.redirect('/')
        }
    }   
     res.redirect('/login')
}