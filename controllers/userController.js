const User = require('../models/userModel');
const Product = require('../models/productModel');
const Brand =require('../models/BrandModel')

const loadHome = async (req, res) => {
    try {
        const products = await Product.find({ deleted: false })
            .populate({
                path: 'category',
                match: { deleted: false }  
            })
            .populate({
                path: 'brand',
                match: { isActive: true }  
            })
            .exec();

        // Filter out products where the category is null or brand is null 
        const filteredProducts = products.filter(product => product.category && product.brand);

        const user = await User.findById(req.session.user_id);

        // Fetch active brands
        const brands = await Brand.find({ isActive: true });
        return res.render('userHome', {
            
            user,
            products: filteredProducts,
            brands,
            successMessage: '',
            errorMessage: ''
        });

    } catch (error) {
        console.error('Error loading user home:', error);

        return res.render('userHome', {
            user: null,
            products: [],
            brands: [],
            successMessage: '',
            errorMessage: "An error occurred while loading your home page."
        });
    }
};


module.exports = {
    loadHome
};
