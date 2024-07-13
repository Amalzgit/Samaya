const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const loadAdminHome = async (req, res) => {
    try {
        // Example data for demonstration
        const usersCount = 0; 
        const name = "admin"; 
        const productsCount = 0;
        const ordersCount = 0; 
        const totalRevenue = 0
        
        res.render('adminDash', { usersCount, name, productsCount, ordersCount, totalRevenue });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.render('adminDash', { message: "An error occurred" });
    }
};

module.exports = {
    loadAdminHome
};
