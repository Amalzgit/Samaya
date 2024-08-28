const Product = require('../models/productModel');
const { calculateOfferDiscount, calculatefinalPrice } = require('../utils/offerCalculator');

const getProductById = async (req,res)=>{
    try {
        const productId =req.params.id;
       
        let product =await Product.findById(productId).populate('category').populate('brand');

        if (product && typeof product === 'object' && product !== null) {
            // Calculate discount for the single product
            const discount = await calculateOfferDiscount(product._id);
        
            if (discount) {
                const offerPrice = calculatefinalPrice(product.price, discount);
                // Update the product with the discount details
                product.originalPrice = product.price;
                product.price = offerPrice;
                product.hasOffer = true;
                product.discountPercentage = discount;
            } else {
                product.hasOffer = false;
            }
        }
        if(!product){
            return res.render('shop',{message:"product not found"});
        }
        const relatedProducts = await Product.find({ category: product.category, _id: { $ne: productId } }).limit(4);

        res.render('ProductDetails', { product, relatedProducts ,successMessage:"",errorMessage:""});
    } catch (error) {
        console.log('Error getting product',error);
        return res.render('shop',{})
    }
}

module.exports ={
    getProductById
}