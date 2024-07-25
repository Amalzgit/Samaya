const Product = require('../models/productModel')
const Category =require('../models/catogaryModel')

const loadShop = async (req, res) => {

        const { category } = req.query;
    
        try {
            // Find all products and populate 'category' field with active categories
            const products = await Product.find({})
                .populate({
                    path: 'category',
                    match: { 'deleted': false } // Filter out deleted categories
                })
                .exec();
    
            // Filter products to exclude those with null or deleted categories
            const filteredProducts = products.filter(product => product.category && !product.category.deleted);
    
            let filter = {};
    
            if (category) {
                // Find the category document based on the name and check if it's active
                const categoryDoc = await Category.findOne({ name: category, deleted: false });
    
                if (categoryDoc) {
                    // Filter products by matching category ID
                    filter = { category: categoryDoc._id };
                } else {
                    // Handle case where category name does not exist or is deleted
                    console.error(`Category '${category}' not found or deleted.`);
                    return res.render('shop', { products: [], categories: [], successMessage: '', errorMessage: 'Category not found or deleted' });
                }
            }
    
            // Fetch all active categories
            const categories = await Category.find({ deleted: false });
    
            // Fetch products based on filter (category if provided) and ensure categories are not deleted
            const productsToShow = await Product.find({ deleted: false, ...filter })
                .populate({
                    path: 'category',
                    match: { 'deleted': false } // Ensure categories in products are not deleted
                })
                .exec();
    
            // Filter products again to exclude those with deleted categories
            const filteredProductsToShow = productsToShow.filter(product => product.category && !product.category.deleted);
    
            // Render the 'shop' view with products, categories, and messages
            return res.render('shop', { products: filteredProductsToShow, categories, successMessage: '', errorMessage: '' });
    
        } catch (error) {
            console.error('Error loading shop page:', error);
            return res.render('shop', { successMessage: '', errorMessage: 'An error occurred' });
        }
    };
    
  
    
module.exports = {
  loadShop
};
