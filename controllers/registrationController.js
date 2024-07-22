const User = require('../models/userModel');
const {validationResult} = require('express-validator');


const loadRegister = async (req, res) => {
    try {
       return res.render('userRegister', {successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading user registration:', error);
       return res.render('userRegister', { errorMessage: "An error occurred" });
    }
};

const insertUser = async (req, res) => {
    const { firstName, lastName, email, phone, password, isAdmin } = req.body;
  
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('userRegister', { successMessage: null, errorMessage: errors.array() });
      }
  
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.render('userRegister', { successMessage: null, errorMessage: 'Email already exists' });
      }
  
      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password,
        isAdmin
      });
  
      const userData = await newUser.save();
      if (userData) {
        return res.render('userRegister', { successMessage: 'Your registration is successful. Please verify your email.', errorMessage: null });
      } else {
        return res.render('userRegister', { successMessage: null, errorMessage: 'Your registration has failed' });
      }
    } catch (error) {
      console.error('Error inserting user:', error);
  
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res.render('userRegister', { successMessage: null, errorMessage: 'Email already exists' });
      }
  
      return res.render('userRegister', { successMessage: null, errorMessage: 'An error occurred during registration. Please try again.' });
    }
  };

  module.exports = {
    loadRegister,
    insertUser
  };