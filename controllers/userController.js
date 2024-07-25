const User = require('../models/userModel');
const Product = require('../models/productModel');

const loadHome = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate({
                path: 'category',
                match: { 'deleted': false } 
            })
            .exec();

        const filteredProducts = products.filter(product => product.category !== null);

        const user = await User.findById(req.session.user_id);

        return res.render('userHome', {
            user,
            products: filteredProducts,
            successMessage: '',
            errorMessage: ''
        });

    } catch (error) {
        console.error('Error loading user home:', error);

        return res.render('userHome', {
            user: null,
            errorMessage: "An error occurred while loading your home page."
        });
    }
};


module.exports = {
    loadHome
};
