const isLogedin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next(); // User is logged in, proceed to the next middleware/controller
        } else {
           return res.redirect('/'); // User is not logged in, redirect to the home page
        }
    } catch (error) {
        console.log(error.message);
        return res.render('/', { successMessage: '', errorMessage: "An error occurred while logging in" });
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
           return res.redirect('/'); // Redirect to home if user is already logged in
        } else {
            next(); // User is not logged in, proceed to the next middleware/controller
        }
    } catch (error) {
        console.log(error.message);
        return res.render('/', { successMessage: '', errorMessage: "An error occurred while logging out" });
    }
};

module.exports = {
    isLogedin,
    isLogout
};
