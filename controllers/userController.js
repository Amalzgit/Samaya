const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const {validationResult} = require('express-validator')

const loadRegister = async (req, res) => {
    try {
        res.render('userRegister', { message: null, message: null });
    } catch (error) {
        console.error('Error loading user registration:', error);
        res.render('userRegister', { message: null, message: "An error occurred" });
    }
};

const insertUser = async (req, res) => {
    const { firstName, lastName, email, phone, password, isVerified, isAdmin } = req.body;

    try {
       
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.render('userRegister', { message: null, message: "An error occurred" });
              
            }else{

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            isAdmin,
            isVerified
        })

        const userData = await newUser.save();
        if (userData) {
            res.render('userRegister', { message: 'Your registration is successful. Please verify your email.', message: null });
        } else {
            res.render('userRegister', { message: null, message: "Your registration has failed" });
        }
    }
    } catch (error) {
        console.error('Error inserting user:', error);
        res.render('userRegister', { message: null, message: "An error occurred during registration. Please try again." });
    }

};

const loadHome = async (req, res) => {
    try {
        const userData = await User.findById(req.session.user_id);
        res.render('userHome', { user: userData });
    } catch (error) {
        console.error('Error loading user home:', error);
        res.render('userHome', { user: null, message: "An error occurred while loading your home page." });
    }
};

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error('Error logging out user:', error);
        res.redirect('/');
    }
};

module.exports = {
    loadRegister,
    insertUser,
    loadHome,
    userLogout
};
