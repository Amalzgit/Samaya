const isLogedin = async (req, res, next) => {
    try {
        if (req.session.user_id || req.isAuthenticated() ) {
            next(); 
        } else {
           return res.redirect('/'); 
        }
    } catch (error) {
        console.log(error.message);
        return res.render('/', { successMessage: '', errorMessage: "An error occurred while logging in" });
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id || req.isAuthenticated() ) {
           return res.redirect('/'); 
        } else {
            next(); 
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
