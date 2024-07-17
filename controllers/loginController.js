const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator')

const loginLoad = async (req, res) => {
    try {
        res.render('userLogin', { successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading login page:', error);
        res.render('userLogin', {successMessage:'', errorMessage: "An error occurred" });
    }
};

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('userLogin', {  successMessage:'',errorMessage: 'Please enter valid inputs', errors: errors.array() });
    };

        const userData = await User.findOne({ email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.isVerified === 0) {
                    return res.render('userLogin', { successMessage: "Successfully logged in. Please verify your email.",errorMessage:'' });
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
        res.render('userLogin', { successMessage:'',errorMessage: "An error occurred" });
    }
};

const Logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error('Error in logout:', error);
        res.redirect('/');
    }
};

module.exports = {
    loginLoad,
    verifyLogin,
    Logout
};
