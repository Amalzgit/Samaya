const Product = require('../models/productModel');
const Category = require('../models/catogaryModel');
const Brand = require('../models/BrandModel');

const loadShop = async (req, res) => {
    const { category, brand } = req.query;

    try {
        let filter = { deleted: false };

        if (category) {
            const categoryDoc = await Category.findOne({ name: category, deleted: false });
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            } else {
                console.error(`Category '${category}' not found or deleted.`);
                return res.render('shop', { products: [], categories: [], brands: [], successMessage: '', errorMessage: 'Category not found or deleted' });
            }
        }

        if (brand) {
            const brandDoc = await Brand.findOne({ name: brand, isActive: true });
            if (brandDoc) {
                filter.brand = brandDoc._id;
            } else {
                console.error(`Brand '${brand}' not found or inactive.`);
                return res.render('shop', { products: [], categories: [], brands: [], successMessage: '', errorMessage: 'Brand not found or inactive' });
            }
        }

        const categories = await Category.find({ deleted: false });

        const brands = await Brand.find({ isActive: true }); 

        const productsToShow = await Product.find(filter)
            .populate({
                path: 'category',
                match: { 'deleted': false }
            })
            .populate({
                path: 'brand',
                match: { isActive: true }
            })
            .exec();

        const filteredProductsToShow = productsToShow.filter(product => {
            const validCategory = product.category && !product.category.deleted;
            const validBrand = product.brand && product.brand.isActive;
            return validCategory && validBrand;
        });

        return res.render('shop', { products: filteredProductsToShow, categories, brands, successMessage: '', errorMessage: '' });

    } catch (error) {
        console.error('Error loading shop page:', error);
        return res.render('shop', { successMessage: '', errorMessage: 'An error occurred' });
    }
};

module.exports = {
    loadShop
};
