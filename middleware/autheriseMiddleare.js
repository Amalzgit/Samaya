module.exports= isUser = (req, res, next) => {
    if (req.session.user_id) {
        const isAdmin = req.session.isAdmin;
        if (isAdmin) {
            return res.redirect('/admin/adminhome');
        }
    }
    next()
}
