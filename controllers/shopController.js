const Product = require("../models/productModel");
const Category = require("../models/catogaryModel");
const Brand = require("../models/BrandModel");
const {
    calculateOfferDiscount,
    calculatefinalPrice,
} = require("../utils/offerCalculator");

const loadShop = async (req, res) => {
    try {
        const {
            category,
            brand,
            sort = "featured",
            search,
            page = 1,
        } = req.query;
        const limit = 6;
        const skip = (page - 1) * limit;

        const [categories, brands, categoryDoc, brandDoc] = await Promise.all([
            Category.find({ deleted: false }),
            Brand.find({ isActive: true }),
            category ? Category.findOne({ name: category, deleted: false }) : null,
            brand ? Brand.findOne({ name: brand, isActive: true }) : null,
        ]);

        if (category && !categoryDoc) {
            return res.render("shop", {
                products: [],
                categories,
                brands,
                errorMessage: "Category not found or deleted",
                pagination: {},
                currentSort: sort,
            });
        }
        if (brand && !brandDoc) {
            return res.render("shop", {
                products: [],
                categories,
                brands,
                errorMessage: "Brand not found or inactive",
                pagination: {},
                currentSort: sort,
            });
        }

        const matchStage = { deleted: false };
        if (categoryDoc) matchStage.category = categoryDoc._id;
        if (brandDoc) matchStage.brand = brandDoc._id;
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $lookup: {
                    from: "brands",
                    localField: "brand",
                    foreignField: "_id",
                    as: "brand",
                },
            },
            { $unwind: "$brand" },
            { $match: { "category.deleted": false, "brand.isActive": true } },
        ];

        const sortStages = {
            popularity: { totalSales: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating: { averageRating: -1 },
            newest: { createdAt: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            featured: { featured: -1 },
        };
        
        aggregationPipeline.push({
            $sort: sortStages[sort] || sortStages.featured,
        });

        // Count total products for pagination
        const countPipeline = [...aggregationPipeline, { $count: "total" }];
        const totalResult = await Product.aggregate(countPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // Apply pagination
        aggregationPipeline.push({ $skip: skip }, { $limit: limit });

        let products = await Product.aggregate(aggregationPipeline);

        products = await Promise.all(
            products.map(async (product) => {
                const discount = await calculateOfferDiscount(product._id);
                if (discount) {
                    const offerPrice = calculatefinalPrice(product.price, discount);
                    return {
                        ...product,
                        originalPrice: product.price,
                        price: offerPrice,
                        hasOffer: true,
                        discountPercentage: discount,
                    };
                }
                return {
                    ...product,
                    hasOffer: false,
                };
            })
        );

        const totalPages = Math.ceil(total / limit);
        const currentPage = parseInt(page);

        // Generate page URLs
        const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
        const pageUrls = {};
        for (let i = 1; i <= totalPages; i++) {
            const urlParams = new URLSearchParams(req.query);
            urlParams.set("page", i);
            pageUrls[i] = `${baseUrl}?${urlParams.toString()}`;
        }

        const pagination = {
            currentPage,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPageUrl: currentPage < totalPages ? pageUrls[currentPage + 1] : null,
            prevPageUrl: currentPage > 1 ? pageUrls[currentPage - 1] : null,
            pageUrls,
        };

        res.render("shop", {
            products,
            categories,
            brands,
            errorMessage: "",
            currentCategory: category,
            currentBrand: brand,
            currentSort: sort,
            currentSearch: search,
            pagination,
        });
    } catch (error) {
        console.error("Error loading shop page:", error);
        res.render("shop", {
            products: [],
            categories: [],
            brands: [],
            errorMessage: "An error occurred",
            pagination: {
                currentPage: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
                nextPageUrl: null,
                prevPageUrl: null,
                pageUrls: {},
            },
            currentSort: "featured",
        });
    }
};

module.exports = { loadShop };
