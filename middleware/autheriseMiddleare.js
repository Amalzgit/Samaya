const isUser = (req, res, next) => {
    const isAdmin = req.session.isAdmin;
    const currentPath = req.originalUrl;

    // Check if user is not an admin and is trying to access admin pages
    if (!isAdmin && currentPath.startsWith('/admin')) {
        return res.redirect('/home'); // Redirect non-admin users to the home page
    }

    // Check if user is admin and is trying to access non-admin pages
    if (isAdmin && !currentPath.startsWith('/admin')) {
        return res.redirect('/admin/adminhome'); // Redirect admin users to admin home
    }

    // Proceed to the next middleware if no redirect is needed
    next();
};
module.exports = {
    isUser
};
