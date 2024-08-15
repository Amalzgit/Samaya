const Product = require('../models/productModel');
const Category = require('../models/catogaryModel');
const Brand = require('../models/BrandModel');

const loadShop = async (req, res) => {
    const { category, brand, sort, search } = req.query;

    try {
        const categories = await Category.find({ deleted: false });
        const brands = await Brand.find({ isActive: true });

        const aggregationPipeline = [];

        // Match stage
        const matchStage = { deleted: false };
        if (category) {
            const categoryDoc = await Category.findOne({ name: category, deleted: false });
            if (categoryDoc) {
                matchStage.category = categoryDoc._id;
            } else {
                return res.render('shop', { products: [], categories, brands, successMessage: '', errorMessage: 'Category not found or deleted' });
            }
        }
        if (brand) {
            const brandDoc = await Brand.findOne({ name: brand, isActive: true });
            if (brandDoc) {
                matchStage.brand = brandDoc._id;
            } else {
                return res.render('shop', { products: [], categories, brands, successMessage: '', errorMessage: 'Brand not found or inactive' });
            }
        }
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        aggregationPipeline.push({ $match: matchStage });

        // Lookup stages
        aggregationPipeline.push(
            { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
            { $unwind: '$brand' }
        );

        aggregationPipeline.push({
            $match: {
                'category.deleted': false,
                'brand.isActive': true
            }
        });

        // Sorting stage
        if (sort) {
            let sortStage = {};
            switch (sort) {
                case 'popularity':
                    sortStage = { totalSales: -1 };
                    break;
                case 'price_asc':
                    sortStage = { price: 1 };
                    break;
                case 'price_desc':
                    sortStage = { price: -1 };
                    break;
                case 'rating':
                    sortStage = { averageRating: -1 };
                    break;
                case 'newest':
                    sortStage = { createdAt: -1 };
                    break;
                case 'name_asc':
                    sortStage = { name: 1 };
                    break;
                case 'name_desc':
                    sortStage = { name: -1 };
                    break;
                default:
                    sortStage = { featured: -1 };  
            }
            aggregationPipeline.push({ $sort: sortStage });
        }

        const products = await Product.aggregate(aggregationPipeline);

        res.render('shop', { 
            products, 
            categories, 
            brands, 
            successMessage: '', 
            errorMessage: '',
            currentCategory: category,
            currentBrand: brand,
            currentSort: sort,
            currentSearch: search
        });
    } catch (error) {
        console.error('Error loading shop page:', error);
        res.render('shop', { products: [], categories: [], brands: [], successMessage: '', errorMessage: 'An error occurred' });
    }
};

module.exports = { loadShop };