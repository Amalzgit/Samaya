
const User = require('../models/userModel');

const loadHome = async (req, res) => {
    try {
       
        const userData = await User.findById(req.session.user_id);
        res.render('userHome', { user: userData });
        
    } catch (error) {
        console.error('Error loading user home:', error);
        res.render('userHome', { user: null, errorMessage: "An error occurred while loading your home page." });
    }
};


module.exports = {
    loadHome
};
