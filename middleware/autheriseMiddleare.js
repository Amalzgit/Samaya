const isUser = (req, res, next) => {
    const isAdmin = req.session.isAdmin;
    const currentPath = req.originalUrl;

    // Prevent redirect loops by checking the current path
    if (isAdmin === true && currentPath !== '/admin/adminhome') {
        return res.redirect('/admin/adminhome');
    } else if (isAdmin === false && currentPath !== '/home') {
        return res.redirect('/home');
    }

    // Proceed to the next middleware if no redirect is needed
    next();
};

module.exports = {
    isUser
};
