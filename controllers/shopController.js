const Product = require('../models/productModel');
const Category = require('../models/catogaryModel');
const Brand = require('../models/BrandModel');
const { calculateOfferDiscount, calculatefinalPrice } = require('../utils/offerCalculator');

const loadShop = async (req, res) => {

    try {
    const { category, brand, sort, search } = req.query;
       
        const [categories , brands ,categoryDoc ,brandDoc] = await Promise.all([
            Category.find({ deleted: false }),
            Brand.find({ isActive: true }),
            category ? Category.findOne({ name: category, deleted: false }) : null,
            brand ? Brand.findOne({ name: brand, isActive: true }) : null
        ]);

        if (category && !categoryDoc) {
            return res.render('shop', { products: [], categories, brands, successMessage: '', errorMessage: 'Category not found or deleted' });
        }
        if (brand && !brandDoc) {
            return res.render('shop', { products: [], categories, brands, successMessage: '', errorMessage: 'Brand not found or inactive' });
        }

        // Match stage
        const matchStage = { deleted: false };
        if (categoryDoc) matchStage.category = categoryDoc._id;
        if (brandDoc) matchStage.brand = brandDoc._id;
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const aggregationPipeline = [
            { $match: matchStage },
            { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
            { $unwind: '$brand' },
            { $match: { 'category.deleted': false, 'brand.isActive': true } }
        ];

        // Sorting stage
        const sortStages = {
            popularity: { totalSales: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating: { averageRating: -1 },
            newest: { createdAt: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            default: { featured: -1 }
        };
        aggregationPipeline.push({ $sort: sortStages[sort] || sortStages.default });

        // Execute aggregation pipeline
        let products = await Product.aggregate(aggregationPipeline);


        products = await Promise.all(products.map(async (product) => {
            const discount = await calculateOfferDiscount(product._id);
            if (discount) {
                const offerPrice = calculatefinalPrice(product.price, discount);
                return {
                    ...product,
                    originalPrice: product.price,
                    price: offerPrice,
                    hasOffer: true,
                    discountPercentage: discount
                };
            }
            
            return {
                ...product,
                hasOffer: false
            };
        }));
        

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