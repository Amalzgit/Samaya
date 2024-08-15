module.exports =(req, res, next) => {
    if (req.session.user_id || req.isAuthenticated()) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            return res.redirect('/admin/adminhome');
        }
    }
    next()
}