const isUser = (req, res, next) => {
    const isAdmin = req.session.isAdmin;
    const currentPath = req.originalUrl;

    if (!isAdmin && currentPath.startsWith('/admin')) {
        return res.redirect('/'); 
    }

    if (isAdmin && !currentPath.startsWith('/')) {
        return res.redirect('/admin/adminhome'); 
    }

    next();
}


module.exports = {
    isUser
};
