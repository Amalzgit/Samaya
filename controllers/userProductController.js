const Product = require('../models/productModel');

const getProductById = async (req,res)=>{
    try {
        const productId =req.params.id;
       
        const product =await Product.findById(productId).populate('category').populate('brand');
        
        if(!product){
            return res.render('shop',{message:"product not found"});
        }
        const relatedProducts = await Product.find({ category: product.category, _id: { $ne: productId } }).limit(4);

        res.render('ProductDetails', { product, relatedProducts });
    } catch (error) {
        console.log('Error getting product',error);
        return res.render('shop',{})
    }
}

module.exports ={
    getProductById
}