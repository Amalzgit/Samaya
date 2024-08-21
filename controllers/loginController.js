const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator')

const loginLoad = async (req, res) => {
    try {
       return res.render('userLogin', { successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading login page:', error);
       return res.render('userLogin', {successMessage:'', errorMessage: "An error occurred" });
    }
};

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const errors = validationResult(req);
        console.log(errors);
        
        if (!errors.isEmpty()) {
           return res.render('userLogin', {  successMessage:'',errorMessage:errors.array()});
    };

        const userData = await User.findOne({ email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.isBlocked == true) {
                    return res.render('userLogin', { successMessage: "",errorMessage:'User is blocked' });
                } else {
                    if (userData.isAdmin) {
                        req.session.user_id = userData._id;
                        req.session.isAdmin = true;
                        return res.redirect('/admin/adminhome');
                    } else {
                        req.session.user_id = userData._id;
                        req.session.isAdmin = false;
                        return res.redirect('/');
                    }
                }
            } else {
                return res.render('userLogin', { successMessage:'',errorMessage: "Email and password are incorrect" });
            }
        } else {
            return res.render('userLogin', {successMessage:'', errorMessage: "Email and password are incorrect" });
        }
    } catch (error) {
        console.error('Error in login:', error);
        return res.render('userLogin', { successMessage:'',errorMessage: "An error occurred" });
    }
};

const Logout = async (req, res) => {
    // console.log("logout");
    
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Error during logout');
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error destroying session');
            }
            res.redirect('/login'); 
        });
    });
};

module.exports = {
    loginLoad,
    verifyLogin,
    Logout
};
