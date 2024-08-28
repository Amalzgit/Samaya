const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/BrandModel");
const { calculateOfferDiscount, calculatefinalPrice } = require("../utils/offerCalculator");

const loadHome = async (req, res) => {
  try {
    const [user, brands] = await Promise.all([
      User.findById(req.session.user_id),
      Brand.find({ isActive: true }),
    ]);
    let products = await Product.find({ deleted: false })
      .populate({
        path: "category",
        match: { deleted: false },
      })
      .populate({
        path: "brand",
        match: { isActive: true },
      })
      .exec();

      products = await Promise.all(products.map(async (product) => {
        const discount = await calculateOfferDiscount(product._id);
        if (discount) {
            const offerPrice = calculatefinalPrice(product.price, discount);
            return {
                ...product.toObject(),
                originalPrice: product.price,
                price: offerPrice,
                hasOffer: true,
                discountPercentage: discount
            };
        }
        
        return {
            ...product.toObject(),
            hasOffer: false
        };
    }));
    
    const filteredProducts = products.filter(
      (product) => product.category && product.brand
    );


    return res.render("userHome", {
      user,
      products: filteredProducts,
      brands,
      successMessage: "",
      errorMessage: "",
    });
  } catch (error) {
    console.error("Error loading user home:", error);

    return res.render("userHome", {
      user: null,
      products: [],
      brands: [],
      successMessage: "",
      errorMessage: "An error occurred while loading your home page.",
    });
  }
};

module.exports = {
  loadHome,
};
